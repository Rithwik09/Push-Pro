const { generateToken } = require("../../helpers/jwtHelpers");
const catchAsyncError = require("../../helpers/catch-async-error");
const AdminUserServices = require("../../services/admin/user");
const bcrypt = require("bcrypt");
const EmailServices = require("../../services/email");
const {
  CustomError,
  ErrorHandler,
  ValidationError,
  ServerError
} = require("../../errors/CustomError");

const adminLogin = catchAsyncError(async (req, res, next) => {
  const { email_address, password } = req.body;
  try {
    const admin = await AdminUserServices.getAdminUser({ email_address });
    let isMatch;
    if (admin) {
      isMatch = await bcrypt.compare(password, admin.password);
    }
    if (!isMatch || !admin) {
      throw new ValidationError("Invalid email or password. Please try again.");
    }

    if (admin.status !== true) {
      throw new ValidationError(
        "Your account is currently Inactive. Please contact support for assistance."
      );
    }

    const jwtToken = await generateToken(admin.id, admin.email_address, admin.role_id);
    if (!jwtToken) {
      throw new ErrorHandler(400, "Token Generation Failed");
    }
    const data = {
      id: admin.id,
      first_name: admin.first_name,
      last_name: admin.last_name,
      token: jwtToken,
      email_address: admin.email_address
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Login Successful",
      errors: []
    });
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const adminForgotPassword = catchAsyncError(async (req, res) => {
  const { email_address } = req.body;
  try {
    const adminUser = await AdminUserServices.getAdminUser({ email_address });
    if (!adminUser) {
      throw new ValidationError("Invalid Email Address");
    }
    const emailStatus = await EmailServices.sendAdminPasswordResetEmail(
      email_address
    );
    if (!emailStatus) {
      console.error("Error Sending Admin Forgot Password Email");
    }
    res.status(200).json({
      success: true,
      message: "Password Reset Email Sent!"
    });
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  const verification_code = req.params.token;
  const { password } = req.body;
  try {
    const user = await AdminUserServices.getAdminUser({
      verification_code
    });
    if (!user) {
      throw new ValidationError("Verification Code Expired");
    }
    if (!(await AdminUserServices.validatePassword(password))) {
      throw new ValidationError("Strong Password Required");
    }
    const newPassword = await AdminUserServices.hashPassword(password);
    const updateUser = await AdminUserServices.updateAdminUser(
      { password: newPassword, verification_code: "" },
      { id: user.id }
    );
    if (!updateUser) {
      throw new ValidationError(
        "Cannot Reset Password. Try again after Sometime"
      );
    }
    res.status(200).json({
      success: true,
      message: "Password Reset Successful"
    });
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

module.exports = {
  adminLogin,
  adminForgotPassword,
  resetPassword
};
