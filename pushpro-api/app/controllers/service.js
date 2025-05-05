const ContractorServices = require("../services/contractor/contractorServices");
const Services = require("../services/services");
const catchAsyncError = require("../helpers/catch-async-error");
const UserServices = require("../services/user");
const ProjectServices = require("../services/project");
const {
  ServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} = require("../errors/CustomError");

const checkProjectStatus = (status) => {
  if (status > 4) {
    throw new ValidationError("Estimation Created Cannot Modify");
  }
};

const checkAccess = (userId, customerId) => {
  if (userId !== customerId) {
    throw new UnauthorizedError("Not Authorized. Not your Project");
  }
};

const getServices = catchAsyncError(async (req, res) => {
  try {
    const services = await Services.getAllServices();
    res.status(200).json({
      success: true,
      data: services,
      message: "Services fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Services: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractorServices = catchAsyncError(async (req, res) => {
  try {
    const user_uuid = req.user.user_uuid;
    const user = await UserServices.getUser({ user_uuid: user_uuid });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const services = await ContractorServices.getServicesByContractorId(
      user.id
    );
    const serviceIds = services.map((service) => service.service_id);
    res.status(200).json({
      success: true,
      data: serviceIds,
      message: "Contractor Services fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Contractor Services: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getCustomerContractorServices = catchAsyncError(async (req, res) => {
  try {
    const id = req.user.id;
    const user = await UserServices.getUser({ id: id });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const relation = await UserServices.findrelationByCustomerId(id);
    const services = await ContractorServices.getServicesByContractorId(
      relation.contractor_id
    );
    const serviceIds = services.map((service) => service.service_id);
    res.status(200).json({
      success: true,
      data: serviceIds,
      message: "Customer-Contractor Services fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Customer-Contractor Services: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getProjectServices = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.project_id;
    const services = await Services.getProjectServices(id);
    res.status(200).json({
      success: true,
      data: services,
      message: "Project Services fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Project Services: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const createProjectServices = catchAsyncError(async (req, res) => {
  try {
    const project_id = req.params.id;
    let project = await ProjectServices.getProjectById(project_id);
    checkAccess(req.user.id, project.customer_id);
    const { services } = req.body;
    if (!services || services.length === 0) {
      throw new ValidationError("No Services Selected");
    }
    const projectService = await Services.setProjectServices(
      project_id,
      services
    );
    res.status(200).json({
      success: true,
      status: 200,
      data: projectService.service_id,
      message: "Project Services Created Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create Project Service: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getServices,
  getContractorServices,
  getProjectServices,
  getCustomerContractorServices,
  createProjectServices
};
