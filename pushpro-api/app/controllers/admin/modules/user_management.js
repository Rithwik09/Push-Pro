const { ServerError, ValidationError } = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const AdminUserServices = require("../../../services/admin/user");
// const {
//   ValidationError,
//   CustomError,
//   ServerError
// } = require("../errors/CustomError");

const getAdminUsers = catchAsyncError(async (req, res) => {
  try {
    const users = await AdminUserServices.getAllAdminUsers();
    res.status(200).json({
      success: true,
      data: users,
      message: "Users fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Admin Users: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const addAdminUser = catchAsyncError(async (req, res) => {
  const {
    first_name,
    last_name,
    email_address,
    password,
    phone_no,
    status,
    role_id
  } = req.body;
  try {
    if (!first_name || !email_address || !password) {
      throw new ValidationError("Please provide all required fields");
    }
    if (!(await AdminUserServices.validatePassword(password))) {
      throw new ValidationError("Strong password required");
    }
    const userExists = await AdminUserServices.getAdminUser({ email_address });
    if (userExists) {
      throw new ValidationError("User with Email Already Exists!");
    }
    const hashedPassword = await AdminUserServices.hashPassword(password);
    const newUser = await AdminUserServices.createAdminUser({
      first_name,
      last_name,
      email_address,
      password: hashedPassword,
      phone_no,
      role_id,
      status
    });
    if (!newUser) {
      throw new ServerError("Cannot Add User");
    }
    res.status(200).json({
      success: true,
      data: newUser,
      message: "User added successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Add User: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getAdminUserById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const user = await AdminUserServices.getAdminUserById(id);
    res.status(200).json({
      success: true,
      data: user,
      message: "User fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Get User: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateAdminUser = catchAsyncError(async (req, res) => {
  const {
    first_name,
    last_name,
    email_address,
    // password,
    phone_no,
    status,
    role_id
  } = req.body;
  try {
    const id = req.params.id;
    if (!first_name) {
      throw new ValidationError("Please provide all required fields");
    }
    // if (!(await AdminUserServices.validatePassword(password))) {
    //   throw new ValidationError("Strong password required");
    // }
    // const userExists = await AdminUserServices.getAdminUser({ email_address });
    // if (!userExists) {
    //   throw new ValidationError("User with Email Does Not Exists!");
    // }
    // const hashedPassword = await AdminUserServices.hashPassword(password);
    const updatedUser = await AdminUserServices.updateAdminUser(id, {
      first_name,
      last_name,
      email_address,
      // password: hashedPassword,
      phone_no,
      role_id,
      status
    });
    if (!updatedUser) {
      throw new ServerError("Cannot Update User");
    }
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Update User: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

// const updatePassword = catchAsyncError(async (req, res) => {
//   try {
//     const id = req.params.id;
//     const { password } = req.body;
//     if (!password) {
//       throw new ValidationError("Please provide all required fields");
//     }
//     if(!(await AdminUserServices.validatePassword(password))) {
//       throw new ValidationError("Strong password required");
//     }

//     const hashedPassword = await AdminUserServices.hashPassword(password);
//     const updatedUser = await AdminUserServices.updateAdminUser(id, {
//       password: hashedPassword
//     });
//     if (!updatedUser) {
//       throw new ServerError("Cannot Update User");
//     }
//     res.status(200).json({
//       success: true,
//       data: updatedUser,
//       message: "Password updated successfully",
//       errors: []
//     });
//   } catch (error) {
//     const serverError = new ServerError(`Cannot Update User: ${error.message}`);
//     res.status(serverError.status).json(serverError.serializeError());
//   }
// });

const deleteAdminUser = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await AdminUserServices.deleteAdminUser(id);
    if (!deletedUser) {
      throw new ServerError("Cannot Delete User");
    }
    res.status(200).json({
      success: true,
      data: deletedUser,
      message: "User deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Delete User: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const addRole = catchAsyncError(async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) {
      throw new ValidationError("Please provide all required fields");
    }
    const role = await AdminUserServices.createRole({
      name,
      status
    });
    if (!role) {
      throw new ServerError("Cannot Add Role");
    }
    // const role = await AdminUserServices.createRole(req.body);
    res.status(200).json({
      success: true,
      data: role,
      message: "Role added successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Add Role: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getRoles = catchAsyncError(async (req, res) => {
  try {
    const roles = await AdminUserServices.getAllRoles();
    if (!roles) throw new ServerError("Cannot Get Roles");
    res.status(200).json({
      success: true,
      data: roles,
      message: "Roles fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Get Roles: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getRoleById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const role = await AdminUserServices.getRoleById(id);
    res.status(200).json({
      success: true,
      data: role,
      message: "Role fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Get Role: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateRole = catchAsyncError(async (req, res) => {
  const {
    name
    // , status
  } = req.body;
  try {
    const id = req.params.id;
    if (!name) {
      throw new ValidationError("Please provide required field");
    }
    const updatedRole = await AdminUserServices.updateRole(id, {
      name
      // status
    });
    if (!updatedRole) {
      throw new ServerError("Cannot Update Role");
    }
    res.status(200).json({
      success: true,
      data: updatedRole,
      message: "Role updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Update Role: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const deleteRole = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRole = await AdminUserServices.deleteRole(id);
    if (!deletedRole) {
      throw new ServerError("Cannot Delete Role");
    }
    res.status(200).json({
      success: true,
      data: deletedRole,
      message: "Role deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Delete Role: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getAdminUsers,
  addAdminUser,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  addRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole
};
