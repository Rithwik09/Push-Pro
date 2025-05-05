const validator = require("validator");
const UserServices = require("../../services/user");
const EmailServices = require("../../services/email");
const catchAsyncError = require("../../helpers/catch-async-error");
const {
  ValidationError,
  ServerError,
  NotFoundError
} = require("../../errors/CustomError");

const contractorRegister = catchAsyncError(async (req, res, next) => {
  const { first_name, last_name, email_address, password, phone_no } = req.body;
  try {
    if (!first_name || !email_address || !password) {
      throw new ValidationError("All fields are required");
    }
    if (!validator.isEmail(email_address)) {
      throw new ValidationError("Invalid email address");
    }
    if (!(await UserServices.validatePassword(password))) {
      throw new ValidationError("Strong Password Required");
    }
    const userExists = await UserServices.getUser({ email_address });
    if (userExists.is_customer) {
      throw new ValidationError(
        "Email Already Registered as a Customer. Try Another Email."
      );
    }
    if (userExists) {
      throw new ValidationError("User with Email Already Exists!");
    } else {
      const hashedPassword = await UserServices.hashPassword(password);
      const newUser = await UserServices.createContractor({
        first_name,
        last_name,
        email_address,
        password: hashedPassword,
        phone_no
      });
      await newUser?.save();
      if (!newUser) {
        throw new ServerError("Service Unavailable. Please Try Again.");
      }
      const emailStatus = await EmailServices.sendContractorActivationEmail(
        email_address
      );
      if (!emailStatus) {
        console.error("Error Sending Contractor Account Activation Email");
      }
      res.status(200).json({
        success: true,
        message:
          "Thanks for Registering. Please check your email box (along with Spam box) for Verification Link.",
        errors: []
      });
    }
  } catch (err) {
    const serverError = new ServerError(`Cannot Register: ${err.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const subContractorRegister = catchAsyncError(async (req, res, next) => {
  const user_uuid = req.params.uuid;
  const { first_name, last_name, email_address, password, phone_no } = req.body;
  try {
    if (!first_name || !email_address || !password) {
      throw new ValidationError("All fields are required");
    }
    if (!validator.isEmail(email_address)) {
      throw new ValidationError("Invalid email address");
    }
    if (!(await UserServices.validatePassword(password))) {
      throw new ValidationError("Strong Password Required");
    }
    const contractor = await UserServices.getContractor({ user_uuid });
    if (!contractor) {
      throw new NotFoundError("Contractor Not Found");
    }
    if (email_address === contractor.email_address) {
      throw new ValidationError("Cannot Register Your Own Account.");
    }
    const userEmail = await UserServices.getUser({
      email_address: email_address
    });
    if (userEmail.is_customer) {
      throw new ValidationError(
        "Email Already Registered as a Customer. Try Another Email."
      );
    }
    if (userEmail) {
      const checkRelationExists =
        await UserServices.checkRelationContractorSubContractor(
          userEmail?.id,
          contractor?.id
        );
      if (checkRelationExists) {
        throw new ValidationError(
          "Account Exists With This Contractor. Please Login."
        );
      }
      const previousContractor =
        await UserServices.checkRelationContractorSubContractor(
          userEmail?.id,
          contractor?.id
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
    }
    if (!userEmail) {
      const hashedPassword = await UserServices.hashPassword(password);
      const newUser = await UserServices.createContractor({
        first_name,
        last_name,
        email_address,
        password: hashedPassword,
        phone_no
      });
      await newUser.save();
      if (!newUser) {
        throw new ValidationError("Cannot Create a New User. Please Try Again");
      }
      const contractorSubcontractor =
        await UserServices.contractorSubContractorRelation(
          newUser?.id,
          contractor?.id
        );
      if (!contractorSubcontractor) {
        throw new ValidationError(
          "Cannoit Establish Customer and Contractor Relation. Please Try Again."
        );
      }
      await contractorSubcontractor.save();
      const emailStatus = await EmailServices.sendContractorActivationEmail(
        email_address
      );
      if (!emailStatus) {
        console.error("Error Sending Sub-Contractor Account Activation Email");
      }
      res.status(200).json({
        success: true,
        message: "Thanks for registering. Verify account from the Email Link.",
        errors: []
      });
    }
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
      res.status(err.status).json(err.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Register Sub-Contractor : ${err.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const existingSubContractorRegister = catchAsyncError(
  async (req, res, next) => {
    const user_uuid = req.params.uuid;
    const { email_address } = req.body;
    try {
      const user = await UserServices.getContractor({ user_uuid });
      if (!user) {
        throw new NotFoundError("Contractor Not Found");
      }
      const userEmail = await UserServices.getUser({ email_address });
      if (userEmail) {
        const checkRelationExists =
          await UserServices.checkRelationContractorSubContractor(
            userEmail?.id,
            user?.id
          );
        if (checkRelationExists) {
          res.status(424).json({
            message: "Account Exists With This Contractor. Please Login."
          });
          return;
        }
        const contractorSubcontractor =
          await UserServices.contractorSubContractorRelation(
            userEmail.id,
            user.id
          );
        if (!contractorSubcontractor) {
          throw new ValidationError(
            "Cannoit Establish Customer and Contractor Relation. Please Try Again."
          );
        }
        await contractorSubcontractor.save();
        res.status(200).json({
          success: true,
          message: `You have Registered Successfully with Another Contractor.`,
          data: null,
          errors: []
        });
      }
    } catch (err) {
      if (err instanceof ValidationError || err instanceof NotFoundError) {
        res.status(err.status).json(err.serializeError());
      }
      const serverError = new ServerError(
        `Cannot Register Existing Sub-Contractor : ${err.message}`
      );
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
);

module.exports = {
  contractorRegister,
  subContractorRegister,
  existingSubContractorRegister
};
