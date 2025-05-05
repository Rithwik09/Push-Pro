const bcrypt = require("bcrypt");
const UserServices = require("../services/user");
const EmailServices = require("../services/email");
const { generateToken } = require("../helpers/jwtHelpers");
const catchAsyncError = require("../helpers/catch-async-error");
const {
  CustomError,
  ValidationError,
  ErrorHandler,
  ServerError,
  UnauthorizedError
} = require("../errors/CustomError");

const loginResponse = catchAsyncError(async (req, res) => {
  res.status(200).json({
    message:
      "Login with Active an Email and a Strong Password with UC, LC, Number and Special Characters."
  });
});

const logoutResponse = catchAsyncError(async (req, res) => {
  res.status(200).json({
    message:
      "For Logout Click the Logout Button it will delete the token from the client side."
  });
});

const forgotPasswordResponse = catchAsyncError(async (req, res) => {
  res.status(200).json({
    message:
      "Click the Forgot Password Button and check your email for password reset link."
  });
});

const resetPasswordResponse = catchAsyncError(async (req, res) => {
  res.status(200).json({
    message: "Fill all the Fields, use a Strong Password."
  });
});

const adminLogin = async (req, res) => {
  const { email_address, password } = req.body;
  try {
    const user = await UserServices.getUser({ email_address });
    if (!user) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "User Not Registered",
        errors: []
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Password Mismatch! Enter Correct Password!",
        errors: []
      });
    }
    const jwtToken = await generateToken(user.id, user.email_address);
    const data = {
      id: user.id,
      user_id: user.user_uuid,
      message: `Welcome back, ${user.first_name} ${user.last_name}`,
      token: jwtToken,
      email_notification: user.notification_email,
      sms_notification: user.notification_sms,
      account_status: user.status
    };
    if (user.status === "Inactive") {
      res.status(400).json({
        success: false,
        data: null,
        message: "Please Verify Your Account",
        errors: []
      });
    } else {
      res.status(200).json({
        success: true,
        data,
        message: "Login Successful",
        errors: []
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      data: null,
      message: "Something went wrong",
      errors: [err]
    });
  }
};

const customerForgotPassword = catchAsyncError(async (req, res) => {
  const { email_address } = req.body;
  try {
    const user = await UserServices.getUser({
      email_address: email_address,
      is_customer: true
    });
    if (!user) {
      throw new ValidationError("Invalid Email or User Not Registered");
    }
    if (user?.is_contractor) {
      throw new UnauthorizedError("Invalid Route. Not a Customer");
    }
    if (!user.is_verified) {
      throw new ErrorHandler(
        423,
        "Your account has not been verified. Please verify it first."
      );
    }
    if (user.status === "Inactive") {
      throw new ErrorHandler(
        424,
        "Your account is currently Inactive. Please contact support for assistance."
      );
    }
    const emailStatus = await EmailServices.sendCustomerPasswordResetEmail(
      email_address
    );
    if (!emailStatus) {
      console.error("Error Sending Customer Forgot Password Email");
    }
    res.status(200).json({
      success: true,
      message: "Password Reset Email Sent!"
    });
  } catch (err) {
    if (
      (err instanceof ValidationError,
      err instanceof UnauthorizedError,
      err instanceof ErrorHandler)
    ) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const contractorForgotPassword = catchAsyncError(async (req, res) => {
  const { email_address } = req.body;
  try {
    const user = await UserServices.getUser({
      email_address: email_address,
      is_contractor: true
    });
    if (!user) {
      throw new ValidationError("Invalid Email Address");
    }
    if (!user.is_verified) {
      throw new ErrorHandler(
        423,
        "Your account has not been verified. Please verify it first."
      );
    }
    if (user.status === "Inactive") {
      throw new ErrorHandler(
        424,
        "Your account is currently Inactive. Please contact support for assistance."
      );
    }
    const emailStatus = await EmailServices.sendContractorPasswordResetEmail(
      email_address
    );
    if (!emailStatus) {
      console.error("Error Sending Contractor Forgot Password Email");
    }
    res.status(200).json({
      success: true,
      message: "Password Reset Email Sent!"
    });
  } catch (err) {
    if ((err instanceof ValidationError, err instanceof ErrorHandler)) {
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
    const user = await UserServices.getUser({
      verification_code
    });
    if (!user) {
      throw new ValidationError("Verification Code Expired");
    }
    if (!user.is_verified) {
      throw new ErrorHandler(
        423,
        "Your account has not been verified. Please verify it first."
      );
    }
    if (user.status === "Inactive") {
      throw new ErrorHandler(
        424,
        "Your account is currently Inactive. Please contact support for assistance."
      );
    }
    if (!(await UserServices.validatePassword(password))) {
      throw new ValidationError("Strong Password Required");
    }
    const newPassword = await UserServices.hashPassword(password);
    const updateUser = await UserServices.updateUser(
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
    if (
      (err instanceof CustomError,
      err instanceof ValidationError,
      err instanceof ErrorHandler)
    ) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

module.exports = {
  loginResponse,
  logoutResponse,
  forgotPasswordResponse,
  resetPasswordResponse,
  adminLogin,
  customerForgotPassword,
  contractorForgotPassword,
  resetPassword
};
