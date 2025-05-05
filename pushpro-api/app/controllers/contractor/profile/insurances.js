const validator = require("validator");
const {
  ValidationError,
  ServerError,
  NotFoundError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const InsuranceServices = require("../../../services/contractor/insuranceServices");
const { uploadToS3, deleteFromS3 } = require("../../../helpers/s3Helper");
const moment = require("moment");

const isValidDate = (date) => {
  const parsedDate = moment(date, "MM/DD/YYYY", true);
  if (!parsedDate.isValid()) {
    throw new ValidationError(
      "Invalid date format. Required format MM/DD/YYYY"
    );
  }
  if (!parsedDate.isAfter(moment())) {
    throw new ValidationError("Insurance Expired");
  }
  return true;
};

const getInsurances = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new NotFoundError("User Not Found");
    const insurances = await InsuranceServices.getUserInsurances(userId);
    if (!insurances || insurances.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "Insurances Not Found",
        errors: []
      });
    } else {
      res.status(200).json({
        success: true,
        data: insurances,
        message: "Insurances fetched successfully",
        errors: []
      });
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.status).json(error.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Get Licenses: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const addInsurance = catchAsyncError(async (req, res) => {
  const { title, expirationDate, visibility } = req.body;
  try {
    const userId = req.user.id;
    const files = req.files;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    if (!title) throw new ValidationError("Title Required");
    if (!files || !files.insurance)
      throw new ValidationError("Insurance File Required");
    if (!expirationDate) throw new ValidationError("Expiration Date Required");
    if (typeof visibility === "undefined")
      throw new ValidationError("Visible On Profile Required");
    const visibilityBoolean =
      visibility.toLowerCase() === "true" ? true : false;
    if (!validator.isBoolean(visibility.toString()))
      throw new ValidationError("Invalid Input for Visible On Profile");
    if (!isValidDate(expirationDate))
      throw new ValidationError("Invalid or Expired License Date");
    const uploadPromises = [];
    let insuranceKey;
    if (files.insurance) {
      const insuranceFile = files.insurance[0];
      insuranceKey = `insurances/${Date.now()}_${insuranceFile.originalname}`;
      uploadPromises.push(uploadToS3(insuranceKey, insuranceFile));
      if (!insuranceKey)
        throw new ValidationError("Insurance Key Generation Failed");
    }
    await Promise.all(uploadPromises);
    const insurance = await InsuranceServices.createInsurance({
      user_id: userId,
      title,
      insurance_url: insuranceKey,
      expiration_date: moment(expirationDate, "MM/DD/YYYY").toDate(),
      visible_on_profile: visibilityBoolean
    });
    res.status(200).json({
      success: true,
      data: insurance,
      message: "Insurance added successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot add insurance: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const editInsurance = catchAsyncError(async (req, res) => {
  const { title, expirationDate, visibility } = req.body;
  const id = req.params.id;
  try {
    const userId = req.user.id;
    const files = req.files;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    const visibilityBoolean =
      visibility.toLowerCase() === "true" ? true : false;
    if (!validator.isBoolean(visibility.toString()))
      throw new ValidationError("Invalid Input for Visible On Profile");
    let insurance = await InsuranceServices.getInsurance(id, userId);
    if (!isValidDate(expirationDate))
      throw new ValidationError("Invalid or Expired License Date");
    const uploadPromises = [];
    let insuranceKey = insurance.insurance_url;
    if (files.insurance_url) {
      const insuranceFile = files.insurance_url[0];
      insuranceKey = `insurances/${Date.now()}_${insuranceFile.originalname}`;
      const existingKey = insurance ? insurance.insurance_url : null;
      uploadPromises.push(uploadToS3(insuranceKey, insuranceFile, existingKey));
      if (!insuranceKey)
        throw new ValidationError("Insurance Key Generation Failed");
    }
    await Promise.all(uploadPromises);
    insurance = await InsuranceServices.updateInsurance(id, {
      title: title,
      expiration_date: moment(expirationDate, "MM/DD/YYYY").toDate(),
      insurance_url: insuranceKey,
      visible_on_profile: visibilityBoolean,
      updatedAt: new Date()
    });
    insurance = await InsuranceServices.getInsurance(id, userId);
    res.status(200).json({
      success: true,
      data: insurance,
      message: "Insurance updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Insurance: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const removeInsurance = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    let insurance = await InsuranceServices.getInsurance(id, userId);
    if (insurance.insurance_url) {
      await deleteFromS3(insurance.insurance_url);
    }
    insurance = await InsuranceServices.deleteInsurance(id);
    res.status(200).json({
      success: true,
      data: insurance,
      message: "Insurance removed successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Remove Insurance: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  addInsurance,
  getInsurances,
  editInsurance,
  removeInsurance
};
