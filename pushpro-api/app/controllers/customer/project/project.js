const ProjectServices = require("../../../services/project");
const NotificationService = require("../../../services/notification");
const DocumentServices = require("../../../services/customer/document");
const Services = require("../../../services/services");
const UserServices = require("../../../services/user");
const {
  ValidationError,
  ServerError,
  UnauthorizedError,
  NotFoundError,
  ErrorHandler
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const validator = require("validator");
const moment = require("moment");

const resMessage = catchAsyncError(async (req, res) => {
  res.send({
    message: "Welcome to the Projects Dashboard"
  });
});

const baseUrl = process.env.BASE_URL_CONTRACTOR;

const isValidDate = (date) => {
  const parsedDate = moment(date, "MM/DD/YYYY", true);
  return parsedDate.isValid() && parsedDate.isAfter(moment());
};

const checkProjectStatus = (status) => {
  if (status > 4) {
    throw new ValidationError("Estimation Created Cannot Modify the Project");
  }
};

const checkAccess = (userId, customerId) => {
  if (userId !== customerId) {
    throw new UnauthorizedError("Not Authorized. Not your Project");
  }
};

const getProjectById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const project = await ProjectServices.getProjectById(id);
    checkAccess(userId, project.customer_id);
    let areas = [];
    const fetchedAreas = await ProjectServices.getProjectAreas(project.id);
    if (fetchedAreas) {
      areas = fetchedAreas.map((area) => area.area_id);
    }
    let services = [];
    const fetchedServices = await Services.getProjectServices(project.id);
    if (fetchedServices) {
      services = fetchedServices.map((service) => service.service_id);
    }
    let documents = [];
    const fetchedDocuments = await DocumentServices.getDocuments(project.id);
    if (fetchedDocuments) {
      documents = fetchedDocuments.map((document) => document);
    }
    project.areas = areas;
    project.services = services;
    project.documents = documents;
    res.status(200).json({
      success: true,
      data: project,
      message: "Project Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Project Details : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getCustomerProjects = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserServices.getCustomerById({
      id: userId,
      is_customer: true
    });
    if (!user) throw new NotFoundError("User Not Found");

    const {
      limit = 5,
      pageNo = 1,
      search,
      condition,
      services,
      contractorId
    } = req.body;

    const contractor = await UserServices.getContractorById({
      user_uuid: contractorId,
      is_contractor: true
    });
    if (!contractor) throw new NotFoundError("Contractor Not Found");

    const { projects, totalPages, totalItems } =
      await ProjectServices.getCustomerProjects(userId, {
        pageNo,
        limit,
        search,
        condition: { ...condition, contractor_id: contractor.id },
        services
      });

    const projectDetails = await Promise.all(
      projects.map(async (project) => {
        let areas = await ProjectServices.getProjectAreas(project.id);
        let services = await Services.getProjectServices(project.id);
        areas = areas.map((area) => area.area_id);
        services = services.map((service) => service.service_id);
        return {
          ...project.dataValues,
          areas,
          services
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        projects: projectDetails,
        totalPages,
        totalItems
      },
      message: "Projects Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Projects: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getDashboardProjectStatuses = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const contId = req.params.id;
    const user = await UserServices.getCustomerById({ id: userId });
    if (!user) throw new ValidationError("Customer Not Found");
    const contractor = await UserServices.getContractor({ user_uuid: contId });
    if (!contractor) throw new ValidationError("Contractor Not Found");
    const projectStatuses = await ProjectServices.getCustomerProjectStatuses(
      userId,
      contractor?.id
    );
    res.status(200).json({
      success: true,
      data: projectStatuses || {},
      message: "Dashboard Project Statuses Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Project Statuses: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const createProject = catchAsyncError(async (req, res) => {
  try {
    const {
      project_id,
      title,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_code,
      user_uuid
    } = req.body;
    const userId = req.user.id;
    const payload = {
      customer_id: userId,
      title,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_code,
      user_uuid,
      created_by: userId
    };
    let project;
    let status_message;
    if (project_id && project_id !== 0) {
      project = await ProjectServices.updateProject(payload, {
        id: project_id
      });
      project = await ProjectServices.getProjectById(project_id);
      status_message = "Updated";
    } else {
      project = await ProjectServices.createProject(payload);
      status_message = "Drafted";
    }
    const data = {
      ...(project.dataValues || project),
      status_message
    };
    res.status(200).json({
      success: true,
      data: data,
      message:
        project_id && project_id !== 0
          ? "Project Updated Successfully"
          : "Project Created Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create or Update Project: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateProjectDatePreference = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess(userId, project.customer_id);
    const { date_preference, start_date, end_date } = req.body;
    let payload = {};
    if (!validator.isBoolean(date_preference.toString())) {
      throw new ValidationError("Invalid Date Preference Input");
    }
    if (date_preference) {
      if (!isValidDate(start_date)) {
        console.error("Invalid Start Date");
      }
      payload = {
        date_preference: date_preference.toString() === "true",
        start_date: moment(start_date, "MM/DD/YYYY").toISOString(),
        end_date: moment(end_date, "MM/DD/YYYY").toISOString()
      };
    } else {
      payload = {
        date_preference: false,
        start_date: null,
        end_date: null
      };
    }
    project = await ProjectServices.updateProject(payload, { id: projectId });
    project = await ProjectServices.getProjectById(projectId);
    res.status(200).json({
      success: true,
      data: project,
      message: "Project Date Preferences Updated Successfully",
      errors: []
    });
  } catch (error) {
    console.error("Error:", error);
    const serverError = new ServerError(
      `Cannot Update Project Date Preference: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateProjectBudgetPreference = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess(req.user.id, project.customer_id);
    const { budget_preference, budget_min, budget_max } = req.body;
    const budgetPreferenceStr = budget_preference.toString();
    const budgetMinStr = budget_min?.toString() || 0;
    const budgetMaxStr = budget_max?.toString() || 0;
    let payload = {};
    if (budget_preference) {
      payload = {
        budget_preference: true,
        budget_min: parseFloat(budgetMinStr),
        budget_max: parseFloat(budgetMaxStr)
      };
    } else {
      payload = {
        budget_preference: false,
        budget_min: 0,
        budget_max: 0
      };
    }
    project = await ProjectServices.updateProject(payload, {
      id: projectId
    });
    project = await ProjectServices.getProjectById(projectId);
    res.status(200).json({
      success: true,
      data: project,
      message: "Project Budget Preferences Updated Successfully",
      errors: []
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(
        `Cannot Update Project Budget Preference: ${err.message}`
      );
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const updateProjectType = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess(userId, project.customer_id);
    const { project_type } = req.body;
    const validProjectTypes = ["Commercial", "Residential"];
    if (!validProjectTypes.includes(project_type)) {
      throw new ValidationError("Invalid Project Type");
    }
    const payload = { project_type: project_type };
    project = await ProjectServices.updateProject(payload, {
      id: projectId
    });
    project = await ProjectServices.getProjectById(projectId);
    res.status(200).json({
      success: true,
      data: project,
      message: "Project Type Updated Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Project Type: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateProjectCategory = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess(req.user.id, project.customer_id);
    const { project_category } = req.body;
    const validProjectCategories = ["Renovation", "Addition"];
    if (!validProjectCategories.includes(project_category)) {
      throw new ValidationError("Invalid Project Category");
    }
    const payload = { project_category: project_category };
    project = await ProjectServices.updateProject(payload, {
      id: projectId
    });
    project = await ProjectServices.getProjectById(projectId);
    res.status(200).json({
      success: true,
      data: project,
      message: "Project Category Updated Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Project Category: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateProjectDescription = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const { description } = req.body;
    const payload = { description: description };
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess(req.user.id, project.customer_id);
    project = await ProjectServices.updateProject(payload, {
      id: projectId
    });
    project = await ProjectServices.getProjectById(projectId);
    res.status(200).json({
      success: true,
      data: project,
      message: "Project Description Updated Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Project Description: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const projectVerifyAndSubmit = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess(userId, project.customer_id);
    const payload = { status_id: 2 };
    if (project.status_id < 3) {
      project = await ProjectServices.updateProject(payload, { id: projectId });
    }
    project = await ProjectServices.getProjectById(projectId);
    const data = {
      project: project,
      status_message: "Requirements Sent"
    };
    const customer = await UserServices.getCustomerById({
      id: project.customer_id
    });
    if (!customer) throw new NotFoundError("Customer Not Found");
    const contractor = await UserServices.getContractorById({
      id: project.contractor_id
    });
    if (!contractor) throw new NotFoundError("Contractor Not Found");
    const notificationPayload = {
      user_id: contractor.id,
      type_id: 1,
      project_id: projectId,
      text: "Project Requirements Received",
      link: baseUrl + "/project-detail/" + projectId,
      is_read: false
    };
    const notification = await NotificationService.createNotification(
      notificationPayload
    );
    if (!notification)
      throw new ErrorHandler(423, "Notification Creation Failed.");
    if (contractor.notification_email) {
      const emailTemplate = "PROJECT_DETAILS";
      const emailStatus = await ProjectServices.sendProjectNotificationEmail(
        customer,
        contractor,
        emailTemplate,
        "customer",
        projectId
      );
      if (!emailStatus) {
        console.error("Error Sending Project Notification Email");
      }
    }
    if (contractor.notification_sms) {
      const smsStatus = await ProjectServices.sendProjectNotificationSms(
        contractor.phone_no,
        `Project Requirements Received. Open the below link in browser.
        ${baseUrl}/project-detail/${projectId}`
      );
      if (!smsStatus) {
        console.error("Error Sending Project Notification SMS");
      }
    }
    res.status(200).json({
      success: true,
      data: data,
      message: "Project Requirements Verified and Submitted Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Verify and Submit Project: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const deleteProject = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    let project = await ProjectServices.getProjectById(projectId);
    if (!projectId || !validator.isNumeric(projectId))
      throw new ValidationError("Invalid Project ID");
    checkAccess(req.user.id, project.customer_id);
    if (project.status_id > 2) {
      throw new ValidationError("Estimation Already Created.");
    }
    project = await ProjectServices.deleteProject(projectId);
    res.status(200).json({
      success: true,
      data: project,
      message: "Project Deleted Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Delete Project: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  resMessage,
  getProjectById,
  getCustomerProjects,
  getDashboardProjectStatuses,
  createProject,
  updateProjectDatePreference,
  updateProjectBudgetPreference,
  updateProjectType,
  updateProjectCategory,
  updateProjectDescription,
  projectVerifyAndSubmit,
  deleteProject
};

/* 
Full Customer Project Flow : 
title+address => date-preference => budget-preference => project-type => project-category => project-areas => project-services => project-documents => verify and submit => My Projects Page 
*/
