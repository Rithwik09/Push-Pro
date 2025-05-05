const { generateToken } = require("../../helpers/jwtHelpers");
const catchAsyncError = require("../../helpers/catch-async-error");
const UserServices = require("../../services/user");
const EmailServices = require("../../services/email");
const bcrypt = require("bcrypt");
const {
  ErrorHandler,
  ValidationError,
  UnauthorizedError,
  ServerError
} = require("../../errors/CustomError");

exports.customerLogin = catchAsyncError(async (req, res, next) => {
  const user_uuid = req.params.id;
  const { email_address, password } = req.body;
  try {
    const contractor = await UserServices.getContractor({ user_uuid });
    if (!contractor) {
      throw new UnauthorizedError("Contractor Not Found : Invalid ID");
    }
    const user = await UserServices.getCustomer({ email_address });
    let isMatch;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    }
    if (!user || !isMatch) {
      throw new ValidationError("Invalid email or password. Please try again.");
    }
    const getRelation = await UserServices.checkRelation(
      user.id,
      contractor.id
    );
    if (!getRelation) {
      throw new UnauthorizedError(
        "Cannot Login : Customer Not Associated with Contractor"
      );
    }
    if (!user.is_customer) {
      throw new ValidationError("Invalid email or password. Please try again.");
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
    const jwtToken = await generateToken(user.id, user.email_address);
    if (!jwtToken) {
      throw new ErrorHandler(400, "Token Generation Failed");
    }
    const data = {
      user_uuid: user.user_uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      token: jwtToken,
      is_customer: user.is_customer,
      is_contractor: user.is_contractor,
      is_verified: user.is_verified,
      is_guided: user.is_guided,
      status: user.status,
      profile_url: user.profile_url
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Login Successful",
      errors: []
    });
  } catch (err) {
    if (
      err instanceof ValidationError ||
      err instanceof UnauthorizedError ||
      err instanceof ErrorHandler
    ) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

exports.resendcustomerverification = catchAsyncError(async (req, res) => {
  const { email_address } = req.body;
  try {
    const user = await UserServices.getCustomer({ email_address });
    if (!user) {
      throw new ValidationError("Invalid email. Please try again.");
    }
    if (!user.is_customer) {
      throw new ValidationError("Invalid email. Please try again.");
    }
    if (!user.is_verified) {
      const emailStatus = await EmailServices.sendCustomerActivationEmail(
        email_address
      );
      if (!emailStatus) {
        console.error("Error Sending Customer Account Activation Email");
      }
      return res.status(200).json({
        success: true,
        message:
          "New Verification Link Sent. Please check your email box (along with Spam box).",
        errors: []
      });
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.status).json(err.serializeError());
    }
    const serverError = new ServerError(`Cannot Register: ${err.message}`);
    return res.status(serverError.status).json(serverError.serializeError());
  }
});
