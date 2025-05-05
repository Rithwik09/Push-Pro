const { generateToken } = require("../../../helpers/jwtHelpers");
const UserServices = require("../../../services/user");
const validator = require("validator");
const {
  ValidationError,
  ServerError,
  ErrorHandler
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const { uploadToS3 } = require("../../../helpers/s3Helper");

const getProfile = catchAsyncError(async (req, res) => {
  try {
    const user = await UserServices.getUser({ id: req.user.id });
    const data = {
      user_uuid: user.user_uuid,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email_address: req.user.email_address,
      phone_no: req.user.phone_no,
      profile_url: req.user.profile_url
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Profile fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get User Profile: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getNotificationPreferences = catchAsyncError(async (req, res) => {
  try {
    const data = {
      user_uuid: req.user.user_uuid,
      notification_email: req.user.notification_email,
      notification_sms: req.user.notification_sms
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Profile fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get User Profile: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getJoyride = catchAsyncError(async (req, res) => {
  try {
    existingUser = await UserServices.getUser({ id: req.user.id });
    if (!existingUser) {
      throw new ValidationError("Invalid User ID");
    }
    const data = {
      user_uuid: existingUser.user_uuid,
      is_guided: existingUser.is_guided
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "User guided successfully",
      errors: null
    });
  } catch (error) {
    const serverError = new ServerError(`Update Failed: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateJoyride = catchAsyncError(async (req, res) => {
  try {
    const joyride = req.body.joyride;
    if (joyride === null) {
      throw new ValidationError("Null Value Not Allowed");
    }
    let existingUser = await UserServices.getUser({ id: req.user.id });
    if (!existingUser) {
      throw new ValidationError("Invalid User ID");
    }
    const updates = {};
    updates.is_guided = joyride;
    const updateUser = await UserServices.updateUser(updates, {
      id: req.user.id
    });
    if (!updateUser) {
      throw new ValidationError("Update Failed");
    }
    existingUser = await UserServices.getUser({ id: req.user.id });
    const data = {
      user_uuid: existingUser.user_uuid,
      is_guided: existingUser.is_guided
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "User guided successfully",
      errors: null
    });
  } catch (error) {
    const serverError = new ServerError(`Update Failed: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateProfile = catchAsyncError(async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email_address: newEmailAddress,
      phone_no
    } = req.body;

    if (!newEmailAddress) {
      throw new ValidationError("Email Required");
    }

    if (!validator.isEmail(newEmailAddress)) {
      throw new ValidationError("Invalid Email");
    }

    let existingUser = await UserServices.getUser({ id: req.user.id });

    if (!existingUser) {
      throw new ValidationError("Invalid User ID");
    }

    const emailExists = await UserServices.getUser({
      email_address: newEmailAddress
    });

    if (emailExists && emailExists.id !== req.user.id) {
      throw new ErrorHandler(424, "Email Already Exists");
    }

    const updates = {};
    let jwtToken = null;

    updates.first_name = first_name;
    updates.last_name = last_name;
    updates.phone_no = phone_no;

    if (
      validator.isEmail(newEmailAddress) &&
      newEmailAddress !== existingUser.email_address
    ) {
      jwtToken = await generateToken(req.user.id, newEmailAddress);

      if (!jwtToken) {
        throw new ValidationError("Token Generation Failed");
      }

      updates.email_address = newEmailAddress;
    }

    if (req.files && req.files.profile_url) {
      const fileUploadResult = await uploadToS3(
        `profile-images/${Date.now()}_${req.files.profile_url[0].originalname}`,
        req.files.profile_url[0]
      );

      updates.profile_url = fileUploadResult.fileKey;
    }

    existingUser = await UserServices.updateUser(updates, {
      id: req.user.id
    });

    if (!existingUser) {
      throw new ValidationError("Profile Update Failed");
    }

    const user = await UserServices.getUser({ id: req.user.id });

    const data = {
      user_uuid: user.user_uuid,
      first_name: first_name,
      last_name: last_name,
      email_address: newEmailAddress,
      phone_no: phone_no,
      token: jwtToken !== null ? jwtToken : null,
      is_customer: user.is_customer,
      is_contractor: user.is_contractor,
      is_verified: user.is_verified,
      status: user.status,
      profile_url: user.profile_url
    };

    res.status(200).json({
      success: true,
      data: data,
      message: "Profile Updated successfully",
      errors: null
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ErrorHandler) {
      res.status(error.status).json(error.serializeError());
    } else {
      const serverError = new ServerError(
        `Profile Update Failed: ${error.message}`
      );
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const updateNotificationPreferences = catchAsyncError(async (req, res) => {
  try {
    const { notification_email, notification_sms } = req.body;
    if (notification_email === null || notification_sms === null) {
      throw new ValidationError("Null Value Not Allowed");
    }
    let existingUser = await UserServices.getUser({ id: req.user.id });
    if (!existingUser) {
      throw new ValidationError("Invalid User ID");
    }
    const updates = {};
    updates.notification_email = notification_email;
    updates.notification_sms = notification_sms;
    const updateUser = await UserServices.updateUser(updates, {
      id: req.user.id
    });
    if (!updateUser) {
      throw new ValidationError("Update Failed");
    }
    existingUser = await UserServices.getUser({ id: req.user.id });
    const data = {
      user_uuid: existingUser.user_uuid,
      email_notification: existingUser.notification_email,
      sms_notification: existingUser.notification_sms
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Notification Preferences Updated Successfully",
      errors: null
    });
  } catch (error) {
    const serverError = new ServerError(`Update Failed: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const changePassword = catchAsyncError(async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await UserServices.getUser({ id: req.user.id });
    await UserServices.comparePasswords(current_password, user.password);
    await UserServices.validatePassword(new_password);
    const newPassword = await UserServices.hashPassword(new_password);
    const [updatedRowCount] = await UserServices.updateUser(
      {
        password: newPassword
      },
      { id: req.user.id }
    );
    if (updatedRowCount === 0) {
      throw new ValidationError("Failed to update user data");
    }
    res.status(200).json({
      success: true,
      data: { updatedAt: user.updatedAt },
      message: "Password Changed Successfully",
      errors: null
    });
  } catch (error) {
    const serverError = new ServerError(
      `Failed to Change Password: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getProfile,
  getNotificationPreferences,
  updateProfile,
  updateNotificationPreferences,
  changePassword,
  getJoyride,
  updateJoyride
};
