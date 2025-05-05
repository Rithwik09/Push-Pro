const LicenseServices = require("../services/contractor/licenseServices");
const catchAsyncError = require("../helpers/catch-async-error");
const { ServerError } = require("../errors/CustomError");

const getAllStates = catchAsyncError(async (req, res) => {
  try {
    const states = await LicenseServices.getAllStates();
    res.status(200).json({
      success: true,
      data: states,
      message: "States fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Get States: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getAllStates
};
