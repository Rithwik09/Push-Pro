const validator = require("validator");
const EmailServices = require("../../services/email");
const catchAsyncError = require("../../helpers/catch-async-error");
const {
  ValidationError,
  NotFoundError,
  ErrorHandler,
  ServerError
} = require("../../errors/CustomError");
const UserServices = require("../../services/user");

exports.customerRegister = catchAsyncError(async (req, res) => {
  const user_uuid = req.params.uuid;
  const { first_name, last_name, email_address, password, phone_no } = req.body;
  if (!email_address || !password) {
    throw new ValidationError("Email Address and Password are required");
  }
  if (!validator.isEmail(email_address)) {
    throw new ErrorHandler(402, "Invalid email address");
  }
  if (!(await UserServices.validatePassword(password))) {
    throw new ErrorHandler(403, "Strong password required");
  }
  try {
    const contractor = await UserServices.getContractor({ user_uuid });
    if (!contractor) {
      throw new NotFoundError("Contractor not found: Invalid UUID");
    }
    const userExists = await UserServices.getUser({ email_address });
    if (userExists.is_contractor) {
      throw new ValidationError(
        "Email Already Registered as a Contractor. Try Another Email."
      );
    }
    if (userExists) {
      const previousContractor = await UserServices.checkRelation(
        userExists.id,
        contractor.id
      );
      if (!previousContractor) {
        res.status(202).json({
          message: `You have already registered for another contractor. Do you want to register for ${contractor.first_name} ${contractor.last_name}?`,
          alertCode: "REGISTER_FOR_ANOTHER_CONTRACTOR"
        });
      }
      if (previousContractor) {
        res.status(200).json({
          success: true,
          message: "Already Registered with this Contractor. Please Login.",
          errors: []
        });
      }
    } else {
      const hashedPassword = await UserServices.hashPassword(password);
      const newUser = await UserServices.createCustomer({
        first_name,
        last_name,
        email_address,
        password: hashedPassword,
        phone_no
      });
      const contractorCustomer = await UserServices.contractorCustomerRelation(
        newUser.id,
        contractor.id
      );
      if (!contractorCustomer) {
        return new ServerError(
          "Cannot Establish Customer and Contractor Relation. Please Try Again."
        );
      }
      await contractorCustomer.save();
      const emailStatus = await EmailServices.sendCustomerActivationEmail(
        email_address
      );
      if (!emailStatus) {
        console.error("Error Sending Customer Account Activation Email");
      }
      await newUser.save();
      res.status(200).json({
        success: true,
        message:
          "Thanks for Registering. Please check your email box (along with Spam box) for Verification Link.",
        errors: []
      });
    }
  } catch (err) {
    if (
      err instanceof ErrorHandler ||
      err instanceof ValidationError ||
      err instanceof NotFoundError
    ) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

exports.customerExistingRegister = catchAsyncError(async (req, res) => {
  const user_uuid = req.params.uuid;
  const { email_address } = req.body;
  try {
    const contractor = await UserServices.getContractor({ user_uuid });
    if (!contractor) {
      throw new NotFoundError("Contractor Not Found");
    }
    const userExists = await UserServices.getCustomer({
      email_address: email_address,
      is_customer: true
    });
    if (!userExists) {
      throw new NotFoundError("User Not Found");
    }
    const contractorCustomer = await UserServices.contractorCustomerRelation(
      userExists.id,
      contractor.id
    );
    if (!contractorCustomer) {
      throw new ValidationError(
        "Cannot Establish Customer and Contractor Relation. Please Try Again."
      );
    }
    res.status(200).json({
      success: true,
      message: "Successfully Registered with another Contractor.",
      errors: []
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});
