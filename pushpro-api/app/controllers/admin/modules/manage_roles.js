const { ServerError, ValidationError } = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const UserManagement = require("../../../services/admin/user_management");

const getAllSystemModules = catchAsyncError(async (req, res) => {
  try {
    const data = await UserManagement.getSystemModules();
    res.status(200).json({
      success: true,
      data: data,
      message: "System modules fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot get System Modules: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const assignPermissions = catchAsyncError(async (req, res) => {
  try {
    const { permissions } = req.body;
    const { roleId } = req.params;
    const data = await UserManagement.assignPermissions(roleId, permissions);
    res.status(200).json({
      success: true,
      data: data,
      message: "System modules fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot get System Modules: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getAllSystemModules,
  assignPermissions
}