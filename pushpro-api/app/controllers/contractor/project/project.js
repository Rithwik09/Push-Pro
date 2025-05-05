const ProjectServices = require("../../../services/project");
const NotificationService = require("../../../services/notification");
const DocumentServices = require("../../../services/customer/document");
const Services = require("../../../services/services");
const UserServices = require("../../../services/user");
const {
  ValidationError,
  ServerError,
  ErrorHandler,
  UnauthorizedError,
  NotFoundError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const validator = require("validator");
const moment = require("moment");
const { format, subMonths } = require("date-fns");
const { uploadToS3, deleteFromS3 } = require("../../../helpers/s3Helper");

const checkAccess = (userId, contractorId) => {
  if (userId !== contractorId) {
    return new UnauthorizedError("Not Authorized. Not your Project");
  }
};

const checkAccess2 = (userId, contractorId, customerId) => {
  if (userId !== contractorId && userId !== customerId) {
    return new UnauthorizedError("Not Authorized. Not your Project");
  }
};

const isValidDate = (date) => {
  const parsedDate = moment(date, "MM/DD/YYYY", true);
  return parsedDate.isValid() && parsedDate.isAfter(moment());
};

const isValidUserId = async (user_id) => {
  const user = await UserServices.getCustomer({ id: user_id });
  if (!user) throw new NotFoundError("Invalid Token. Please Login Again");
};

const checkProjectStatus = async (status_id) => {
  if (status_id > 4) {
    throw new ValidationError("Estimation Created Cannot Modify");
  }
};

const baseUrl = process.env.BASE_URL_CONTRACTOR;
const custUrl = process.env.BASE_URL_CUSTOMER;

const getProjectById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const project = await ProjectServices.getProjectById(id);
    checkAccess(userId, project.contractor_id);
    const fetchedCustomer = await UserServices.getCustomer({
      id: project.customer_id
    });
    const { first_name, last_name, email_address, phone_no } = fetchedCustomer;
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
    const fetchedDocuments = await DocumentServices.getDocuments(project.id);
    project.areas = areas;
    project.services = services;
    project.documents = fetchedDocuments;
    project.customerDetails = {
      first_name: first_name,
      last_name: last_name,
      email_address: email_address,
      phone_no: phone_no
    };
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

const getContractorProjects = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ValidationError("User ID is undefined or invalid");

    const user = await UserServices.getContractor({ id: userId });
    if (!user) throw new ValidationError("Invalid User ID");

    const { limit, pageNo, search, services, name, condition = {} } = req.body;

    // Fetch contractor projects with all the filters
    const { projects, totalPages, totalItems } =
      await ProjectServices.getContractorProjects({
        userId,
        pageNo,
        limit,
        search,
        services,
        name,
        condition
      });

    // Map project details with areas and services
    const projectDetails = await Promise.all(
      projects.map(async (project) => {
        const areas = await ProjectServices.getProjectAreas(project.id);
        const services = await Services.getProjectServices(project.id);

        return {
          ...project.dataValues,
          areas: areas.map((area) => area.area_id),
          services: services.map((service) => service.service_id),
          customer_name: project.customer
            ? `${project.customer.first_name} ${project.customer.last_name}`
            : ""
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
    console.error("Error fetching contractor projects:", error);
    const serverError = new ServerError(
      `Cannot Get Projects: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractorProjectByTime = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const { period } = req.body;
    const user = await UserServices.getContractor({ id: userId });
    if (!user) throw new ValidationError("Invalid User ID");
    const endDate = new Date();
    let startDate;
    let monthCount;
    switch (period) {
      case "6 Months":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
        monthCount = 6;
        break;
      case "1 Year":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);
        monthCount = 12;
        break;
      case "3 Years":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 35, 1);
        monthCount = 36;
        break;
      case "5 Years":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 59, 1);
        monthCount = 60;
        break;
      default:
        throw new ValidationError("Invalid period");
    }
    const monthsArray = [];
    for (let i = 0; i < monthCount; i++) {
      const monthDate = subMonths(endDate, i);
      monthsArray.push(format(monthDate, "yyyy-MM"));
    }
    const projects = await ProjectServices.getProjectsByTime({
      userId,
      startDate,
      endDate
    });
    const projectData = monthsArray.map((month) => ({
      month,
      projects: 0
    }));
    projects.forEach((project) => {
      const projectMonth = format(new Date(project.createdAt), "yyyy-MM"); // Format project creation date
      const found = projectData.find((data) => data.month === projectMonth);
      if (found) {
        found.projects += 1;
      }
    });
    res.status(200).json({
      success: true,
      projectData,
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
    const user = await UserServices.getContractorById({ id: userId });
    if (!user) throw new ValidationError("Contractor Not Found");
    const projectStatuses = await ProjectServices.getContractorProjectStatuses(
      userId
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

const contractorCreateProject = catchAsyncError(async (req, res) => {
  try {
    const {
      project_id,
      title,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_code,
      custId,
      user_uuid
    } = req.body;
    if (!req.user || !req.user.id) {
      throw new ValidationError("User ID is required.");
    }
    const userId = req.user.id;
    const payload = {
      customer_id: custId,
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
      data,
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

const contractorProjectDatePreference = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess2(userId, project.contractor_id, project.customer_id);
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

const contractorProjectBudgetPreference = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess2(req.user.id, project.contractor_id, project.customer_id);
    const { budget_preference, budget_min, budget_max } = req.body;
    const budgetPreferenceStr = budget_preference.toString();
    const budgetMinStr = budget_min.toString();
    const budgetMaxStr = budget_max.toString();
    let payload = {};
    if (!validator.isBoolean(budgetPreferenceStr)) {
      throw new ValidationError("Invalid Budget Preference Input");
    }
    if (
      !validator.isDecimal(budgetMinStr) ||
      !validator.isDecimal(budgetMaxStr)
    ) {
      throw new ValidationError("Invalid Budget Input");
    }
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
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Project Budget Preference: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const contractorProjectType = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess2(userId, project.contractor_id, project.customer_id);
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

const contractorProjectCategory = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess2(req.user.id, project.contractor_id, project.customer_id);
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

const contractorProjectAreas = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess2(userId, project.contractor_id, project.customer_id);
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

const contractorProjectDescription = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const { description } = req.body;
    const payload = { description: description };
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess2(req.user.id, project.contractor_id, project.customer_id);
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

const contractorProjectDocument = catchAsyncError(async (req, res) => {
  try {
    const user_id = req.user.id;
    await isValidUserId(user_id);
    const project_id = req.params.id;
    if (!project_id) throw new ValidationError("Project Id Required");
    const project = await ProjectServices.getProjectById(project_id);
    checkProjectStatus(project.status_id);
    const { title } = req.body;
    const files = req.files;
    if (!files || !files.file_url) {
      throw new ValidationError("Image Required");
    }
    let uploadPromises = [];
    let fileKey = null;
    if (files.file_url) {
      const file = files.file_url[0];
      fileKey = `documents/${project_id}/${Date.now()}_${file.originalname}`;
      const existingKey = null;
      uploadPromises.push(uploadToS3(fileKey, file, existingKey));
    }
    await Promise.all(uploadPromises);
    const payload = {
      project_id: project_id,
      title: title,
      file_url: fileKey
    };
    const document = await DocumentServices.createDocument(payload);
    res.status(200).json({
      success: true,
      data: document,
      message: "Document created successfully",
      errors: []
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(error.status).json(error.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Create Document: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const contractorProjectServices = catchAsyncError(async (req, res) => {
  try {
    const project_id = req.params.id;
    let project = await ProjectServices.getProjectById(project_id);
    checkAccess2(req.user.id, project.contractor_id, project.customer_id);
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

const contractorProjectVerifyAndSubmit = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    let project = await ProjectServices.getProjectById(projectId);
    checkAccess2(userId, project.contractor_id, project.customer_id);
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
    const notificationPayload2 = {
      user_id: customer.id,
      type_id: 1,
      project_id: projectId,
      text: "Project Created By Contractor",
      link: custUrl + "/project-detail/" + projectId,
      is_read: false
    };
    const notification2 = await NotificationService.createNotification(
      notificationPayload2
    );
    if (!notification2)
      throw new ErrorHandler(423, "Notification Creation Failed.");
    // if (contractor.notification_email)
    const emailTemplate = "PROJECT_DETAILS_FROM_CONTRACTOR";
    const emailStatus = await ProjectServices.sendProjectNotificationEmail(
      contractor,
      customer,
      emailTemplate,
      "contractor",
      projectId
    );
    if (!emailStatus) {
      console.error("Error Sending Project Notification Email");
    }
    // }
    if (contractor.notification_sms && contractor.phone_no) {
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
    console.error("Error Verifying and Submitting Project:", error);
    const serverError = new ServerError(
      `Cannot Verify and Submit Project: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const deleteContractorProjectDocument = catchAsyncError(async (req, res) => {
  try {
    const user_id = req.user.id;
    await isValidUserId(user_id);
    const id = req.params.id;
    if (!id) throw new ValidationError("Document Id Required");
    let document = await DocumentServices.getDocumentById(id);
    if (document.file_url) {
      await deleteFromS3(document.file_url);
    }
    document = await DocumentServices.deleteDocument(id);
    res.status(200).json({
      success: true,
      data: document,
      message: "Document deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Delete Document: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getProjectById,
  contractorProjectType,
  getContractorProjects,
  contractorProjectAreas,
  contractorCreateProject,
  contractorProjectServices,
  contractorProjectCategory,
  contractorProjectDocument,
  getContractorProjectByTime,
  getDashboardProjectStatuses,
  contractorProjectDescription,
  contractorProjectDatePreference,
  deleteContractorProjectDocument,
  contractorProjectVerifyAndSubmit,
  contractorProjectBudgetPreference
};

/* 
Full Customer Project Flow : 
title+address => date-preference => budget-preference => project-type => project-category => project-areas => project-services => project-documents => verify and submit => My Projects Page 
*/
