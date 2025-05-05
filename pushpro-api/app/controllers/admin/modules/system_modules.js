const { ServerError } = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const AdminSystemModules = require("../../../services/admin/system_modules");

const getSystemModules = catchAsyncError(async (req, res) => {
  try {
    const data = await AdminSystemModules.getAdminSystemModules();
    res.status(200).json({
      success: true,
      data: data,
      message: "System modules fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get System Modules: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getSystemModules
}