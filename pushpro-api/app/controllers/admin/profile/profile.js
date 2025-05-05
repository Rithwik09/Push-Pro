const catchAsyncError = require("../../../helpers/catch-async-error");
const { ValidationError, ServerError } = require("../../../errors/CustomError");
const AdminUserServices = require("../../../services/admin/user");
const { generateToken } = require("../../../helpers/jwtHelpers");
const validator = require("validator");

const getAdminProfile = catchAsyncError(async (req, res) => {
  try {
    const data = {
      first_name: req.admin.first_name,
      last_name: req.admin.last_name,
      email_address: req.admin.email_address,
      phone_no: req.admin.phone_no,
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Profile fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Admin Profile: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

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

const updateAdminProfile = catchAsyncError(async (req, res) => {
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
    let existingUser = await AdminUserServices.getAdminUser({ id: req.admin.id });
    if (!existingUser) {
      throw new ValidationError("Invalid User ID");
    }
    const emailExists = await AdminUserServices.getAdminUser({
      email_address: newEmailAddress
    });
    if (emailExists && emailExists.id !== req.admin.id) {
      throw new ValidationError("Email Already Exists");
    }
    const updates = {};
    var jwtToken = null;
    updates.first_name = first_name;
    updates.last_name = last_name;
    updates.phone_no = phone_no;
    if (
      validator.isEmail(newEmailAddress) &&
      newEmailAddress !== req.admin.email_address
    ) {
      jwtToken = await generateToken(req.admin.id, newEmailAddress);
      if (!jwtToken) {
        throw new ValidationError("Token Generation Failed");
      }
      updates.email_address = newEmailAddress;
    }
    // existingUser = await AdminUserServices.updateAdminUser(updates, {
    //   id: req.admin.id
    // });
    existingUser = await AdminUserServices.updateAdminUserProfile(updates, {id: req.admin.id});

    if (!existingUser) {
      throw new ValidationError("Profile Update Failed");
    }
    const admin = await AdminUserServices.getAdminUser({ id: req.admin.id });
    const data = {
      first_name: first_name,
      last_name: last_name,
      email_address: newEmailAddress,
      phone_no: phone_no,
      token: jwtToken !== null ? jwtToken : null
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Profile Updated successfully",
      errors: null
    });
  } catch (error) {
    const serverError = new ServerError(
      `Profile Update Failed: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const changeAdminPassword = catchAsyncError(async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const admin = await AdminUserServices.getAdminUser({ id: req.admin.id });
    const checkPass = await AdminUserServices.comparePasswords(current_password, admin.password);
    await AdminUserServices.validatePassword(new_password);
    const newPassword = await AdminUserServices.hashPassword(new_password);
    const [updatedRowCount] = await AdminUserServices.updateAdminUserProfile(
      {
        password: newPassword
      },
      { id: req.admin.id }
    );
    if (updatedRowCount === 0) {
      throw new ValidationError("Failed to update user data");
    }
    res.status(200).json({
      success: true,
      data: { updatedAt: admin.updatedAt },
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
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdminUsers
}