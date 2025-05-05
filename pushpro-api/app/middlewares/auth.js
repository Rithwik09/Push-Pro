const { verifyJwtToken } = require("../helpers/jwtHelpers");
const catchAsyncError = require("../helpers/catch-async-error");
const jwt = require("jsonwebtoken");
const {
  UnauthorizedError,
  CustomError,
  ServerError
} = require("../errors/CustomError");
const UserService = require("../services/user");
const ProjectServices = require("../services/project");
const AdminUserServices = require("../services/admin/user");
const EstimationServices = require("../services/contractor/estimation");
const { ValidationError } = require("sequelize");
const { admin_roles } = require("../../models/admin_roles");

const getUserFromToken = async (token, next) => {
  const decode = await verifyJwtToken(
    token,
    next,
    new UnauthorizedError("Token Expired. Please Login.")
  );
  if (!decode) throw new ValidationError("Invalid Token");
  return await UserService.getCustomer({ email_address: decode.email_address });
};

const getAdminFromToken = async (token, next) => {
  const decode = await verifyJwtToken(
    token,
    next,
    new UnauthorizedError("Token Expired. Please Login.")
  );
  if (!decode) throw new ValidationError("Invalid Token");
  return await AdminUserServices.getAdminUser({
    email_address: decode.email_address
  });
};

exports.checkCustomerLogin = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next(new UnauthorizedError("Auth Header is missing", 409));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new UnauthorizedError("Auth token is required", 409));
  }
  try {
    const user = await getUserFromToken(token, next);
    if (!user) {
      return next(new UnauthorizedError("Token Expired. Please Login."));
    }
    if (user.is_customer) {
      req.user = extractUserDetails(user);
      req.authToken = token;
      next();
    } else {
      return next(
        new UnauthorizedError(
          "Unauthorized Access: Customer Cannot Access Contractor Routes",
          401
        )
      );
    }
  } catch (err) {
    handleAuthError(err, res);
  }
});

exports.checkContractorLogin = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next(new UnauthorizedError("Auth Header is missing", 409));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new UnauthorizedError("Auth token is required", 409));
  }
  try {
    const user = await getUserFromToken(token, next);
    if (!user) {
      return next(new UnauthorizedError("Token Expired. Please Login."));
    }
    if (user.is_contractor) {
      req.user = extractUserDetails(user);
      req.authToken = token;
      next();
    } else {
      return next(
        new UnauthorizedError(
          "Unauthorized Access: Customer Cannot Access Contractor Routes",
          401
        )
      );
    }
  } catch (err) {
    handleAuthError(err, res);
  }
});

exports.checkAdminLogin = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next(
      new UnauthorizedError(
        "Your session has expired. Please login again.",
        409
      )
    );
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new UnauthorizedError("Auth token is required", 409));
  }
  try {
    const admin = await getAdminFromToken(token, next);
    if (!admin) {
      return next(new UnauthorizedError("Token Expired. Please Login."));
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const role_id = decodedToken.role_id;
    const role = await AdminUserServices.getRoleById(role_id);
    if (!role) {
      return next(new UnauthorizedError("Role not found.", 404));
    }
    const moduleName = req.headers["module_name"];
    const action = req.headers["action"];
    if (role.name === "Super Admin" || moduleName === "dashboard") {
      req.admin = extractAdminDetails(admin);
      req.authToken = token;
      return next(); // Allow access
    }
    req.permissions = role.permissions;
    if (!moduleName || !action) {
      return next(
        new UnauthorizedError("Module name and action are required", 400)
      );
    }
    const modulePermissions = req.permissions[moduleName];
    if (!modulePermissions || !modulePermissions.includes(action)) {
      return next(
        new UnauthorizedError(
          "You do not have permission to access this module",
          403
        )
      );
    }
    req.admin = extractAdminDetails(admin);
    req.authToken = token;
    next();
  } catch (err) {
    console.error("error", err);
    handleAuthError(err, res);
  }
});

exports.checkAdminLoginWithoutPermissions = catchAsyncError(
  async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return next(
        new UnauthorizedError(
          "Your session has expired. Please login again.",
          409
        )
      );
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(new UnauthorizedError("Auth token is required", 409));
    }
    try {
      const admin = await getAdminFromToken(token, next);
      if (!admin) {
        return next(new UnauthorizedError("Token Expired. Please Login."));
      }
      req.admin = extractAdminDetails(admin);
      req.authToken = token;
      next();
    } catch (err) {
      handleAuthError(err, res);
    }
  }
);
const extractUserDetails = (user) => ({
  id: user.id,
  user_uuid: user.user_uuid,
  email_address: user.email_address,
  phone_no: user.phone_no,
  first_name: user.first_name,
  last_name: user.last_name,
  notification_email: user.notification_email,
  notification_sms: user.notification_sms,
  is_customer: user.is_customer,
  is_contractor: user.is_contractor,
  account_status: user.status
});

const extractAdminDetails = (admin) => ({
  id: admin.id,
  email_address: admin.email_address,
  phone_no: admin.phone_no,
  first_name: admin.first_name,
  last_name: admin.last_name
});

const handleAuthError = (err, res) => {
  if (err instanceof CustomError) {
    res.status(err.status).json(err.serializeError());
  } else {
    const serverError = new ServerError(err.message);
    res.status(serverError.status).json(serverError.serializeError());
  }
};

exports.checkAccessMiddleware = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user.id;
    let cid;
    if (req.params.id || req.params.eid) {
      const estimation = await EstimationServices.getById(
        req.params.id || req.params.eid
      );
      cid = estimation.contractor_id;
    } else if (req.params.pid) {
      const project = await ProjectServices.getProjectById(req.params.pid);
      cid = project.contractor_id;
    } else if (req.body.contractor_id) {
      cid = req.body.contractor_id;
    } else {
      cid = userId;
    }
    const user = await UserService.getContractor({ id: userId });
    if (!user) {
      throw new ValidationError("Invalid User ID");
    }
    if (userId !== cid) {
      throw new UnauthorizedError(
        "Your are Not Authorized to access this Data."
      );
    }
    next();
  } catch (error) {
    handleAuthError(error, res);
  }
});
