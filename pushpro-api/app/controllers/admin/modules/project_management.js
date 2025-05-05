const catchAsyncError = require("../../../helpers/catch-async-error");
const { ServerError } = require("../../../errors/CustomError");
const AdminUserServices = require("../../../services/admin/user");

const getAllProjects = catchAsyncError(async (req, res) => {
  try {
    const { pageNo, limit, search, condition } = req.body;
    const projects = await AdminUserServices.getAllProjects({
      pageNo: pageNo || 1,
      limit: limit || 10,
      search: search || "",
      condition: condition || {}
    });
    res.status(200).json({
      success: true,
      data: {
        projects
        // totalPage: totalPage
      },
      message: "Projects fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get All Projects: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getProjectById = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await AdminUserServices.getProjectById(projectId);
    res.status(200).json({
      success: true,
      data: project,
      message: "Project fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Get Project: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getAllProjects,
  getProjectById
};
