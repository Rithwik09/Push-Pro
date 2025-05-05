require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../../models");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");
const UserServices = require("../services/user");
const catchAsyncError = require("../helpers/catch-async-error");
const {
  ValidationError,
  CustomError,
  ServerError
} = require("../errors/CustomError");

const registerResponseMessage = catchAsyncError(async (req, res) => {
  res.status(200).json({
    message: `Register yourself. Use Active Email and a Strong Password`
  });
});
const activationResponseMessage = catchAsyncError(async (req, res) => {
  res.status(200).json({
    message: "Verify your account from the Email Link."
  });
});

const adminRegister = catchAsyncError(async (req, res) => {
  const { first_name, last_name, email_address, password, phone_no } = req.body;
  try {
    const alreadyExistsUser = await db.Users.findOne({
      where: { email_address }
    });
    if (alreadyExistsUser) {
      return res.status(409).json({
        success: false,
        data: null,
        message: "User with email already ",
        errors: []
      });
    }
    if (!validator.isEmail(email_address)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid email address",
        errors: []
      });
    }
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Strong Password Required",
        errors: []
      });
    }
    const hashedPassword = await bcrypt.hash(
      password,
      process.env.SALT_ROUNDS || 10
    );
    const newUser = new db.Users({
      user_uuid: uuidv4().toString(),
      first_name,
      last_name,
      email_address,
      password: hashedPassword,
      phone_no,
      is_contractor: true
    });
    const savedUser = await newUser.save();
    if (!savedUser) {
      return res.status(500).json({
        success: false,
        data: null,
        message: "Error Registering the Contractor",
        errors: []
      });
    }
    res.status(200).json({
      success: true,
      data: savedUser,
      message: `Thanks for registering as a Contractor. Verify account from the Email Link.`,
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

const accountVerification = catchAsyncError(async (req, res) => {
  const verification_code = req.params.id;
  try {
    const user = await UserServices.getUser({ verification_code });
    if (!user) {
      throw new ValidationError("Invalid Account Activation Code");
    }
    if (user.is_verified && user.status === "Active") {
      throw new ValidationError("Account Already Verified and Active");
    }
    const updateUser = await UserServices.updateUser(
      {
        is_verified: true,
        status: "Active",
        verification_code: "",
        updatedAt: new Date()
      },
      { id: user.id }
    );
    if (!updateUser) {
      throw new ValidationError("Account Activation Failed. Contact Admin");
    }
    res.status(200).json({
      success: true,
      message: "Account Verified"
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
  registerResponseMessage,
  adminRegister,
  accountVerification,
  activationResponseMessage
};
