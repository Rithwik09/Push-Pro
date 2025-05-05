const catchAsyncError = require("../helpers/catch-async-error");
const ProjectServices = require("../../app/services/project");
const {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ServerError
} = require("../errors/CustomError");

// const checkProjectStatus = (status) => {
//   if (status !== 1) {
//     throw new ValidationError("Project Already Verified and Submitted");
//   }
// };

const checkAccess = (userId, customerId) => {
  if (userId !== customerId) {
    throw new UnauthorizedError("Not Authorized. Not your Project");
  }
};

const getAreas = catchAsyncError(async (req, res) => {
  try {
    const areas = await ProjectServices.getAreas();
    res.status(200).json({
      success: true,
      data: areas,
      message: "Areas fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Get Areas: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getProjectAreas = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.project_id;
    const areas = await ProjectServices.getProjectAreas(id);
    if (!areas || areas.length === 0) {
      areas = [];
    }
    res.status(200).json({
      success: true,
      data: areas,
      message: "Areas fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Project Areas: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const createProjectAreas = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess(userId, project.customer_id);
    const { areas } = req.body;
    const projectAreas = await ProjectServices.setProjectAreas(
      projectId,
      areas
    );
    project = await ProjectServices.getProjectById(projectId);
    res.status(200).json({
      success: true,
      data: projectAreas.area_id,
      message: "Project Areas Updated Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create Project Areas: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getAreas,
  getProjectAreas,
  createProjectAreas
};
