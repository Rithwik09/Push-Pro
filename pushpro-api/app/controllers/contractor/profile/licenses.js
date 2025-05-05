const validator = require("validator");
const {
  ValidationError,
  ServerError,
  NotFoundError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const LicenseServices = require("../../../services/contractor/licenseServices");
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
    throw new ValidationError("License Expired");
  }
  return true;
};

const getLicenses = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    const licenses = await LicenseServices.getUserLicenses(userId);
    if (!licenses || licenses.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "Licenses Not Found",
        errors: []
      });
    } else {
      res.status(200).json({
        success: true,
        data: licenses,
        message: "Licenses fetched successfully",
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

const addLicense = catchAsyncError(async (req, res) => {
  const {
    service_id,
    license_number,
    nationwide,
    license_states,
    expiration_date,
    visibility
  } = req.body;
  try {
    const userId = req.user.id;
    const files = req.files;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    if (!files || !files.license_url || !license_number || !expiration_date)
      throw new ValidationError("All Files and Fields Required");
    let serviceId = parseInt(service_id) || 1;
    const nationwideBoolean =
      nationwide.toLowerCase() === "true" ? true : false;
    const visibilityBoolean = visibility
      ? visibility.toLowerCase() === "true"
      : false;
    if (!validator.isBoolean(nationwide.toString()))
      throw new ValidationError("Invalid input for nationwide");
    if (!validator.isBoolean(visibility.toString()))
      throw new ValidationError("Invalid input for visibility");
    const expirationDate = new Date(expiration_date);
    if (!isValidDate(expiration_date))
      throw new ValidationError("Invalid or Expired License Date");
    let licenseStates = [];
    if (!nationwideBoolean) {
      let stateIds;
      try {
        stateIds = JSON.parse(license_states);
        if (!Array.isArray(stateIds)) {
          throw new Error("Invalid state IDs format");
        }
      } catch (error) {
        throw new ValidationError("Invalid input for license states");
      }
      const states = await LicenseServices.getStatesByIds(stateIds);
      licenseStates = states.map((state) => state.id);
    }
    const uploadPromises = [];
    let licenseKey;
    if (files.license_url) {
      const licenseFile = files.license_url[0];
      licenseKey = `licenses/${Date.now()}_${licenseFile.originalname}`;
      await uploadToS3(licenseKey, licenseFile);
      if (!licenseKey) {
        throw new ValidationError("License Key Generation Failed");
      }
    }
    await Promise.all(uploadPromises);
    const license = await LicenseServices.createLicense({
      user_id: userId,
      service_id: serviceId,
      license_number: license_number,
      nationwide: nationwideBoolean,
      license_states: JSON.stringify(licenseStates),
      license_url: licenseKey,
      expiration_date: moment(expirationDate, "MM/DD/YYYY").toDate(),
      visible_on_profile: visibilityBoolean
    });
    res.status(200).json({
      success: true,
      data: license,
      message: "License added successfully",
      errors: []
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(error.status).json(error.serializeError());
    } else {
      const serverError = new ServerError(
        `License Creation Failed: ${error.message}`
      );
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const editLicense = catchAsyncError(async (req, res) => {
  const {
    service_id,
    license_number,
    nationwide,
    license_states,
    expiration_date,
    visibility
  } = req.body;
  const id = req.params.id;
  try {
    const userId = req.user.id;
    const files = req.files;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    let license = await LicenseServices.getLicense(id);
    if (license.user_id !== userId)
      throw new NotFoundError("Invalid Contractor-License ID");
    if (!license_number || !expiration_date)
      throw new ValidationError("All Files and Fields Required");
    let serviceId = parseInt(service_id) || 1;
    const nationwideBoolean =
      nationwide && nationwide.toLowerCase() === "true" ? true : false;
    const visibilityBoolean =
      visibility && visibility.toLowerCase() === "true" ? true : false;
    if (nationwide && !validator.isBoolean(nationwide.toString()))
      throw new ValidationError("Invalid input for nationwide");
    if (visibility && !validator.isBoolean(visibility.toString()))
      throw new ValidationError("Invalid input for visibility");
    const expirationDate = new Date(expiration_date);
    if (!isValidDate(expiration_date))
      throw new ValidationError("Invalid or Expired License Date");
    let licenseStates = [];
    if (!nationwideBoolean) {
      let stateIds;
      try {
        stateIds = JSON.parse(license_states);
        if (!Array.isArray(stateIds)) {
          throw new Error("Invalid State IDs format");
        }
      } catch (error) {
        throw new ValidationError("Invalid input for license states");
      }
      const states = await LicenseServices.getStatesByIds(stateIds);
      licenseStates = states.map((state) => state.id);
    }
    const uploadPromises = [];
    let licenseKey;
    if (files.license_url) {
      const licenseFile = files.license_url[0];
      licenseKey = `licenses/${Date.now()}_${licenseFile.originalname}`;
      const existingKey = license ? license.license_url : null;
      await uploadToS3(licenseKey, licenseFile, existingKey);
      if (!licenseKey) {
        throw new ValidationError("License Key Generation Failed");
      }
    }
    await Promise.all(uploadPromises);
    license = await LicenseServices.updateLicense(id, {
      service_id: serviceId,
      license_number: license_number,
      nationwide: nationwideBoolean,
      license_url: licenseKey,
      license_states: JSON.stringify(licenseStates),
      expiration_date: moment(expirationDate, "MM/DD/YYYY").toDate(),
      visible_on_profile: visibilityBoolean
    });
    res.status(200).json({
      success: true,
      data: license,
      message: "License edited successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Edit License: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const removeLicense = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    let license = await LicenseServices.getLicense(id);
    if (license.license_url) {
      await deleteFromS3(license.license_url);
    }
    license = await LicenseServices.deleteLicense(id);
    res.status(200).json({
      success: true,
      data: id,
      message: "License Deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Remove License: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = { getLicenses, addLicense, editLicense, removeLicense };
