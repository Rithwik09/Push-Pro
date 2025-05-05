const { generateToken } = require("../../helpers/jwtHelpers");
const bcrypt = require("bcrypt");
const EmailServices = require("../../services/email");
const ContractorBrandingServices = require("../../services/contractor/brandingServices");
const catchAsyncError = require("../../helpers/catch-async-error");
const UserServices = require("../../services/user");
const ContractorInvitesServices = require("../../services/contractor/invitesService");
const {
  ErrorHandler,
  ValidationError,
  ServerError,
  UnauthorizedError,
  NotFoundError
} = require("../../errors/CustomError");

const contractorLogin = catchAsyncError(async (req, res, next) => {
  const { email_address, password } = req.body;
  try {
    const user = await UserServices.getContractor({ email_address });
    let isMatch;
    let company_details = false;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
      const details = await UserServices.getCompanyDetails(user.id);
      if (details) {
        company_details = true;
      }
    }
    if (!user || !isMatch) {
      throw new ValidationError("Invalid email or password. Please try again.");
    }
    if (!user.is_contractor) {
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
      account_status: user.status,
      profile_url: user.profile_url,
      company_details: company_details
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Login Successful",
      errors: []
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof ErrorHandler) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const resendVerification = catchAsyncError(async (req, res) => {
  const { email_address } = req.body;
  try {
    const user = await UserServices.getContractor({ email_address });
    if (!user) {
      throw new ValidationError("Invalid email or password. Please try again.");
    }
    if (!user.is_contractor) {
      throw new ValidationError("Invalid email or password. Please try again.");
    }
    if (!user.is_verified) {
      const emailStatus = await EmailServices.sendContractorActivationEmail(
        email_address
      );
      if (!emailStatus) {
        console.error("Error Sending Contractor Account Activation Email");
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

const getInviteTemplates = catchAsyncError(async (req, res) => {
  try {
    const id = req.user.id;
    const user = await UserServices.getContractor({ id });
    if (!user) {
      throw new NotFoundError("Contractor Not Found");
    }
    const branding = await ContractorBrandingServices.getBranding(id);
    let logoStatus = true;
    if (!branding || !branding?.main_logo) {
      logoStatus = false;
    }
    const template = await EmailServices.getInviteTemplates(
      user.first_name + " " + user.last_name,
      user.user_uuid,
      branding?.main_logo ||
        "logos/toggle_logo_dark/1726040603436_contractor1-logo.jpg"
    );
    res.status(200).json({
      success: true,
      data: template,
      main_logo: logoStatus,
      message: "Email Templates fetched successfully",
      errors: []
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(err.status).json(err.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Get Invitation Email Template : ${err.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const sendInvitationEmail = catchAsyncError(async (req, res, next) => {
  const { emails, email_for, message } = req.body;
  try {
    const id = req.user.id;
    if (!id) {
      throw new UnauthorizedError("Invalid ID. Please Login Again");
    }
    if (!emails || !email_for || emails.length === 0) {
      throw new ValidationError("All Fields are required");
    }
    const user = await UserServices.getContractor({ id });
    if (!user) {
      throw new NotFoundError("Contractor Not Found");
    }
    const branding = await ContractorBrandingServices.getBranding(id);
    if (!branding) {
      throw new NotFoundError("Branding Not Found");
    }
    const invite = await ContractorInvitesServices.createInvite({
      contractor_id: id,
      users: emails,
      type: "Email",
      message: message || ""
    });
    if (!invite) {
      throw new ValidationError(
        "Error Creating Email Invite Data. Please try again"
      );
    }
    for (let i = 0; i < emails.length; i++) {
      const emailStatus = await EmailServices.sendInvitationEmail(
        emails[i],
        email_for,
        message,
        user.dataValues.first_name + " " + user.dataValues.last_name,
        user.dataValues.user_uuid,
        branding?.main_logo ||
          "logos/toggle_logo_dark/1726040603436_contractor1-logo.jpg"
      );
      if (!emailStatus) {
        console.error("Error Sending Email Invitations");
      }
    }
    res.status(200).json({
      success: true,
      message: "Email Invitations Sent Successfully",
      errors: []
    });
  } catch (err) {
    if (
      err instanceof ValidationError ||
      err instanceof NotFoundError ||
      err instanceof UnauthorizedError
    ) {
      res.status(err.status).json(err.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Send Email Invitations: ${err.message}`
    );
    return res.status(serverError.status).json(serverError.serializeError());
  }
});

const sendInvitationSms = catchAsyncError(async (req, res, next) => {
  const { phone_numbers, sms_for, message } = req.body;
  try {
    const id = req.user.id;
    if (!id) {
      throw new UnauthorizedError("Invalid ID. Please Login Again");
    }
    if (!phone_numbers || !sms_for || phone_numbers.length === 0) {
      throw new ValidationError("All Fields are required");
    }
    const user = await UserServices.getContractor({ id: id });
    if (!user) {
      throw new NotFoundError("Contractor Not Found");
    }
    const invite = await ContractorInvitesServices.createInvite({
      contractor_id: id,
      users: phone_numbers,
      type: "SMS",
      message: message || ""
    });
    if (!invite) {
      throw new ValidationError(
        "Error Creating SMS Invite Data. Please try again"
      );
    }
    for (let i = 0; i < phone_numbers.length; i++) {
      const smsStatus = await EmailServices.sendInvitationSms(
        phone_numbers[i],
        sms_for,
        message,
        user.dataValues.user_uuid
      );
      if (!smsStatus) {
        console.error("Error Sending SMS Invitations");
      }
    }
    res.status(200).json({
      success: true,
      message: "SMS Invitations Sent Successfully",
      errors: []
    });
  } catch (err) {
    if (
      err instanceof ValidationError ||
      err instanceof NotFoundError ||
      err instanceof UnauthorizedError
    ) {
      res.status(err.status).json(err.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Send SMS Invitations : ${err.message}`
    );
    return res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  contractorLogin,
  resendVerification,
  getInviteTemplates,
  sendInvitationEmail,
  sendInvitationSms
};
