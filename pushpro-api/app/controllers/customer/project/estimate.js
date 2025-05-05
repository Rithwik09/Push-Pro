const {
  ValidationError,
  ServerError,
  NotFoundError,
  UnauthorizedError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const EstimationServices = require("../../../services/contractor/estimation");
const EstimationItemServices = require("../../../services/contractor/estimation/items");
const UserServices = require("../../../services/user");
const ProjectServices = require("../../../services/project");
const NotificationService = require("../../../services/notification");

const baseUrl = process.env.BASE_URL_CONTRACTOR;

const checkAccess = async (userId, customerId) => {
  if (userId !== customerId) {
    return new UnauthorizedError("Your are not authorized to access this data");
  }
};

const getEstimationById = catchAsyncError(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const project = await ProjectServices.getProjectById(id);
    checkAccess(userId, project.customer_id);
    const estimation = await EstimationServices.getByProjectId(id);
    if (!estimation) throw new NotFoundError("Estimation Not Found");
    res.status(200).json({
      success: true,
      data: estimation,
      message: "Estimation Data Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Estimation By ID: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getEstimationByUuid = catchAsyncError(async (req, res) => {
  try {
    const { id: uuid } = req.params;
    const limit = req.body.limit || 500;
    if (!uuid) throw new NotFoundError("Estimation Not Found");
    const projectDetails = await ProjectServices.getProjectIdByUuid(uuid);
    if (!projectDetails) throw new NotFoundError("Project Not Found");
    const [rawCustomer, rawContractor, companyDetails, estimation] =
      await Promise.all([
        UserServices.getCustomerById(projectDetails.customer_id),
        UserServices.getContractorById(projectDetails.contractor_id),
        UserServices.getCompanyDetails(projectDetails.contractor_id, [
          "id",
          "user_id"
        ]),
        EstimationServices.getByProjectId(projectDetails.id)
      ]);
    if (!rawCustomer || !rawContractor || !estimation)
      throw new NotFoundError("Invalid Project Estimation");
    const estimationItems = await EstimationItemServices.getAll({
      limit,
      condition: {
        estimation_id: estimation.id
      }
    });
    const Estimation = {
      customer: {
        first_name: rawCustomer.first_name,
        last_name: rawCustomer.last_name,
        email_address: rawCustomer.email_address,
        phone_no: rawCustomer.phone_no
      },
      contractor: {
        first_name: rawContractor.first_name,
        last_name: rawContractor.last_name,
        email_address: rawContractor.email_address,
        phone_no: rawContractor.phone_no,
        user_uuid: rawContractor.user_uuid
      },
      projectDetails: {
        address_line_1: projectDetails.address_line_1,
        address_line_2: projectDetails.address_line_2,
        city: projectDetails.city,
        state: projectDetails.state,
        zip_code: projectDetails.zip_code
      },
      companyDetails,
      estimationDetails: estimation,
      items: estimationItems
    };
    return res.status(200).json({
      success: true,
      message: "Estimation details fetched successfully",
      data: { Estimation }
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});
const getEstimationItems = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.estId;
    const userId = req.user.id;
    const estimation = await EstimationServices.getById(id);
    const project = await ProjectServices.getProjectById(estimation.project_id);
    checkAccess(userId, project.customer_id);
    const result = await EstimationItemServices.getAll({
      limit: req.body.limit || 1000,
      condition: {
        estimation_id: id
      }
    });
    const { estimations, totalPage } = result;
    if (!estimations) throw new ValidationError("Estimations Items Not Found");
    const sortedEstimationItems = estimations.sort(
      (a, b) => a.position - b.position
    );
    res.status(200).json({
      success: true,
      data: sortedEstimationItems,
      message: "Estimation Items Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Estimation Items: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractorProfileById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const project = await ProjectServices.getProjectById(id);
    checkAccess(userId, project.customer_id);
    const contractor = await UserServices.getContractor({
      id: project.contractor_id
    });
    if (!contractor) {
      throw new NotFoundError("Contractor Not Found");
    }
    const data = {
      first_name: contractor.first_name,
      last_name: contractor.last_name,
      email_address: contractor.email_address,
      phone_no: contractor.phone_no
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Profile fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get User Profile: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractorCompanyDetails = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const project = await ProjectServices.getProjectById(id);
    checkAccess(userId, project.customer_id);
    const companyDetails = await UserServices.getCompanyDetails(
      project.contractor_id,
      ["id", "user_id"]
    );
    res.status(200).json({
      success: true,
      data: companyDetails,
      message: "Profile fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get User Profile: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const estimateAccepted = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const { projectId } = req.body;
    const userId = req.user.id;
    const project = await ProjectServices.getProjectById(projectId);
    checkAccess(userId, project.customer_id);
    const updateProject = await ProjectServices.updateProject(
      {
        status_id: 5
      },
      {
        id: projectId
      }
    );
    const updateEstimate = await EstimationServices.updateEstimation(id, {
      estimation_status_id: 3
    });
    const notification = await NotificationService.createNotification({
      user_id: project.contractor_id,
      type_id: 6,
      project_id: projectId,
      text: "Estimation Accpeted By Customer",
      link: `${baseUrl}/myprojects`,
      is_read: false
    });
    if (!notification) {
      throw new NotFoundError("Notification Creation Failed.");
    }
    res.status(200).json({
      success: true,
      data: updateEstimate,
      message: "Estimation Accepted Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Accept Estimation: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const estimateRejected = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const { projectId } = req.body;
    const userId = req.user.id;
    const project = await ProjectServices.getProjectById(projectId);
    checkAccess(userId, project.customer_id);
    const updateProject = await ProjectServices.updateProject(
      {
        status_id: 6
      },
      {
        id: projectId
      }
    );
    const updateEstimate = await EstimationServices.updateEstimation(id, {
      estimation_status_id: 4
    });
    const notification = await NotificationService.createNotification({
      user_id: project.contractor_id,
      type_id: 7,
      project_id: projectId,
      text: "Estimation Rejected By Customer",
      link: `${baseUrl}/myprojects`,
      is_read: false
    });
    if (!notification) {
      throw new NotFoundError("Notification Creation Failed.");
    }
    res.status(200).json({
      success: true,
      data: updateEstimate,
      message: "Estimation Rejected",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Reject Estimation: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getEstimationById,
  getEstimationItems,
  getEstimationByUuid,
  getContractorProfileById,
  getContractorCompanyDetails,
  estimateAccepted,
  estimateRejected
};
