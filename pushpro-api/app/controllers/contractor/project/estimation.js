const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const {
  ValidationError,
  ServerError,
  NotFoundError,
  UnauthorizedError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const EstimationServices = require("../../../services/contractor/estimation");
const EstimationItemServices = require("../../../services/contractor/estimation/items");
const moment = require("moment");
const UserServices = require("../../../services/user");
const ProjectServices = require("../../../services/project");
const EmailServices = require("../../../services/email");
const NotificationService = require("../../../services/notification");
const BrandingServices = require("../../../services/contractor/brandingServices");
const validator = require("validator");
const { uploadToS3, deleteFromS3 } = require("../../../helpers/s3Helper");
const { v4: uuidv4 } = require("uuid");
const { format, subMonths } = require("date-fns");
const s3BasePath = process.env.S3_BASE_PATH || "";
const baseUrl = process.env.BASE_URL_CUSTOMER;

const generateRandomBase64String = (length) => {
  const uuid = uuidv4();
  const base64String = Buffer.from(uuid, "binary").toString("base64");
  return base64String.substring(0, length).replace(/[^a-zA-Z0-9]/g, "");
};

const generatePDF = async (htmlContent) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { left: "4mm", right: "4mm" }
  });
  await browser.close();
  return pdfBuffer;
};

const checkIsFloat = (value) => {
  if (!validator.isFloat(value, { min: 0 })) {
    throw new ValidationError("Invalid Float Value");
  }
};

const checkEstimationStatus = (statusId) => {
  if (statusId > 1) {
    throw new UnauthorizedError("Estimation Verified and Submitted");
  }
};

const generateEstimationNo = (project_id, contractor_id, customer_id) => {
  const currentDate = moment().format("MMDDYYYY");
  return `est_no_${project_id}${contractor_id}${customer_id},${currentDate}`;
};

const getEstimationByID = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const estimation = await EstimationServices.getById(id);
    res.status(200).json({
      success: true,
      data: estimation,
      message: "Estimation Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Estimation By ID: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getAllEstimations = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, pageNo, search, condition } = req.body;
    const { estimations, totalPage } = await EstimationServices.getAll(userId, {
      pageNo,
      limit,
      search,
      condition
    });
    const data = {
      estimations,
      totalPage
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Estimations fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Estimations: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getTotalRevenue = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const Contractor = await UserServices.getContractor({ id: userId });
    if (Contractor.is_contractor) {
      const result = await EstimationServices.getTotalRevenue(userId);
      const total_total_earning = result.dataValues.total_earnings;
      res.status(200).json({
        success: true,
        data: {
          total_earning: total_total_earning
        },
        message: "Estimation Items Fetched Successfully",
        errors: []
      });
    } else {
      res.status(404).json({
        success: false,
        data: null,
        message: "Contractor Not Found",
        errors: []
      });
    }
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Estimation Items By Estimation ID: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getTotalEstimationRevenue = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const Contractor = await UserServices.getContractor({ id: userId });
    if (Contractor.is_contractor) {
      const result = await EstimationServices.getTotalEstimationRevenue(userId);
      const total_revenue = result.dataValues.total_revenue;
      res.status(200).json({
        success: true,
        data: {
          total_revenue: total_revenue
        },
        message: "Estimation Items Fetched Successfully",
        errors: []
      });
    } else {
      res.status(404).json({
        success: false,
        data: null,
        message: "Contractor Not Found",
        errors: []
      });
    }
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Estimation Items By Estimation ID: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});
const getEstimationByProjectContractorId = catchAsyncError(async (req, res) => {
  try {
    const project_id = req.params.pid;
    const contractor_id = req.user.id;
    let project = await ProjectServices.getProjectById(project_id);
    const estimation = await EstimationServices.getByProjectAndContractorId(
      project_id,
      contractor_id
    );
    if (!estimation) {
      res.status(200).json({
        success: false,
        data: null,
        message: "Estimation Fetched Successfully",
        errors: []
      });
    } else {
      res.status(200).json({
        success: true,
        data: estimation,
        message: "Estimation Fetched Successfully",
        errors: []
      });
    }
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Estimation By Project Contractor ID : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const createEstimate = catchAsyncError(async (req, res) => {
  try {
    const project_id = req.params.pid;
    const contractor_id = req.user.id;
    let project = await ProjectServices.getProjectById(project_id);
    const estimationExists =
      await EstimationServices.getByProjectAndContractorId(
        project_id,
        contractor_id
      );
    if (estimationExists) {
      project = await ProjectServices.updateProject(
        { status_id: 3 },
        {
          id: project_id
        }
      );
      res.status(200).json({
        success: true,
        data: estimationExists,
        message: "Estimation Exists, Update it.",
        errors: []
      });
    } else {
      const estimation_no = generateEstimationNo(
        project_id,
        contractor_id,
        project.customer_id
      );
      const estimate = await EstimationServices.createEstimation({
        project_id: project_id,
        contractor_id: contractor_id,
        estimation_no: estimation_no,
        estimation_status_id: 1
      });
      project = await ProjectServices.updateProject(
        { status_id: 3 },
        {
          id: project_id
        }
      );
      const data = {
        estimate: estimate
      };
      res.status(200).json({
        success: true,
        data: data,
        message: "Estimation Created Successfully",
        errors: []
      });
    }
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create Estimation: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateEstimate = catchAsyncError(async (req, res) => {
  try {
    const {
      estimation_no,
      estimation_date,
      po_number,
      labour_margin,
      material_margin,
      sub_total,
      total,
      contract_text
    } = req.body;
    const estimationId = req.params.id;
    const contractorId = req.user.id;
    let estimate = await EstimationServices.getById(estimationId);
    checkIsFloat(labour_margin);
    checkIsFloat(material_margin);
    checkIsFloat(sub_total);
    checkIsFloat(total);
    if (estimate) {
      const project = await ProjectServices.getProject({
        id: estimate.project_id
      });
      const contractor = await UserServices.getContractor({
        id: contractorId
      });
      const companyDetails = await UserServices.getCompanyDetails(
        contractorId,
        []
      );
      const contractorBranding = await BrandingServices.getBranding(
        contractorId
      );
      const customer = await UserServices.getCustomer(project.customerId);
      let tableDataResponse = await EstimationItemServices.getAll({
        limit: req.body.limit || 1000,
        condition: {
          estimation_id: estimationId
        }
      });
      let tableData = tableDataResponse.estimations.map(
        (item) => item.dataValues
      );
      if (!Array.isArray(tableData)) {
        throw new ValidationError("Invalid tableData format");
      }
      tableData = tableData.map((item) => {
        const materialCost = parseFloat(
          item.quantity * item.material_cost * (1 + item.tax / 100)
        ).toFixed(2);
        const totalItemCost = parseFloat(
          item.labour_cost * (1 + estimate.labour_margin / 100) +
            item.quantity *
              item.material_cost *
              (1 + item.tax / 100) *
              (1 + estimate.material_margin / 100)
        ).toFixed(2);
        return {
          ...item,
          materialCost,
          totalItemCost
        };
      });

      const htmlContent = fs
        .readFileSync(path.join(__dirname, "estimateTemplate.html"), "utf8")
        .replace(
          "{{MainLogo}}",
          contractorBranding?.main_logo
            ? `${s3BasePath}${contractorBranding?.main_logo}`
            : `/assets/images/imgs/no_image_found.jpg`
        )
        .replace("{{CompanyName}}", companyDetails?.company_name || "")
        .replace("{{ContractorAddress1}}", companyDetails?.address_line_1 || "")
        .replace("{{ContractorAddress2}}", companyDetails?.address_line_2 || "")
        .replace(
          "{{ContractorAddress3}}",
          [
            companyDetails?.city,
            companyDetails?.state,
            companyDetails?.zip_code
          ]
            .filter(Boolean)
            .join(", ") || ""
        )
        .replace("{{ContractorPhone}}", contractor?.phone_no || "")
        .replace(
          "{{ContractorEmail}}",
          companyDetails?.company_email || contractor?.email_address || ""
        )
        .replace("{{ContractorWebsite}}", companyDetails?.company_website || "")
        .replace(
          "{{CustomerFullName}}",
          customer?.first_name + " " + customer?.last_name || ""
        )
        .replace("{{AddressLine1}}", project?.address_line_1 || "")
        .replace("{{AddressLine2}}", project?.address_line_2 || "")
        .replace(
          "{{AddressLine3}}",
          [project?.city, project?.state, project?.zip_code]
            .filter(Boolean)
            .join(", ") || ""
        )
        .replace("{{EstimationNo}}", estimation_no || estimate?.estimation_no)
        .replace(
          "{{EstimationDate}}",
          new Date(
            estimation_date || estimate?.estimation_date
          ).toLocaleDateString()
        )
        .replace("{{PoNumber}}", po_number || estimate?.po_number)
        .replace("{{EstimationTotal}}", parseFloat(total).toFixed(2))
        .replace("{{CONTRACT_TEXT}}", contract_text || estimate?.contract_text)
        .replace("{{CompanyName}}", companyDetails?.company_name || "")
        .replace(
          "{{ContractorFullName}}",
          contractor?.first_name + " " + contractor?.last_name || ""
        )
        .replace(
          "{{#tableData}}",
          tableData
            .map(
              (item) => `
          <tr>
            <td>
              <div class="fw-bold">${item.title || item.name}</div>
              <div>${item.description || ""}</div>
            </td>
            <td class="text-end">${item.quantity || ""}</td>
            <td class="text-end">${item.hours || ""}</td>
            <td class="text-end">${item.tax || ""}</td>
            <td class="text-end">${item.labour_cost || ""}</td>
            <td class="text-end">${item.materialCost || ""}</td>
            <td class="text-end pe-4">${item.totalItemCost || ""}</td>
          </tr>
        `
            )
            .join("")
        )
        .replace(
          "{{^tableData}}",
          tableData.length === 0 ? "<tr>Data Not Found</tr>" : ""
        )
        .replace("{{/tableData}}", "");

      if (estimate.estimation_url !== null) {
        await deleteFromS3(estimate.estimation_url.split("/").pop());
      }
      const randomString = generateRandomBase64String(10);
      const pdfKey = `estimates/${randomString}.pdf`;
      const pdfBuffer = await generatePDF(htmlContent);
      const pdfUrl = await uploadToS3(pdfKey, { buffer: pdfBuffer });
      estimate = await EstimationServices.updateEstimation(estimate.id, {
        estimation_no,
        estimation_date,
        po_number,
        labour_margin,
        material_margin,
        sub_total: sub_total,
        total: total,
        contract_text
      });
      estimate = await EstimationServices.updateEstimation(estimate.id, {
        estimation_url: `estimates/${randomString}.pdf`
      });
      res.status(200).json({
        success: true,
        data: estimate,
        message: "Estimation Updated Successfully",
        errors: []
      });
    }
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Estimation: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractorEstimateByTime = catchAsyncError(async (req, res) => {
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

    // Fetch estimates instead of projects
    const estimates = await EstimationServices.getEstimatesByTime({
      userId,
      startDate,
      endDate
    });

    const estimateData = monthsArray.map((month) => ({
      month,
      estimates: 0
    }));

    // Group estimates by month
    estimates.forEach((estimate) => {
      const estimateMonth = format(new Date(estimate.createdAt), "yyyy-MM");
      const found = estimateData.find((data) => data.month === estimateMonth);
      if (found) {
        found.estimates += 1;
      }
    });

    res.status(200).json({
      success: true,
      estimateData,
      message: "Estimates Fetched Successfully",
      errors: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Cannot Get Estimates: ${error.message}`,
      errors: [error.message]
    });
  }
});

const deleteEstimate = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    estimationId;
    const userId = req.user.id;
    const user = await UserServices.getContractor({ id: userId });
    if (!user) throw new ValidationError("Invalid User ID");
    const estimate = await EstimationServices.deleteEstimation(id);
    res.status(200).json({
      success: true,
      data: estimate,
      message: "Estimation Deleted Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Delete Estimation: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const submitEstimateToCustomer = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    let estimation = await EstimationServices.getById(id);
    const project = await ProjectServices.getProjectById(estimation.project_id);
    const customer = await UserServices.getCustomer({
      id: project.customer_id
    });
    if (!customer) throw new NotFoundError("Customer Not Found");
    estimation = await EstimationServices.updateEstimation(id, {
      estimation_status_id: 2
    });
    await ProjectServices.updateProject(
      { status_id: 4 },
      {
        id: project.id
      }
    );
    const estimationUrl = `${baseUrl}/preview-estimate/${project.project_uuid}`;
    const notification = await NotificationService.createNotification({
      user_id: project.customer_id,
      type_id: 5,
      project_id: project.id,
      text: "Estimation has been submitted",
      link: `${baseUrl}/view-estimate/${project.id}`,
      is_read: false
    });
    if (!notification) throw new NotFoundError("Notification Not Created.");
    await EmailServices.sendEstimationCreatedEmail(
      customer.email_address,
      project,
      customer,
      estimationUrl
    );
    if (customer.notification_sms) {
      await EmailServices.sendEstimationCreatedSms(
        customer.phone_no,
        `Estimation Received. Use the below link to view. 
        ${estimationUrl}`
      );
    }
    res.status(200).json({
      success: true,
      data: estimation,
      message: "Estimation Submitted Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Submit Estimation: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getEstimationByID,
  getEstimationByProjectContractorId,
  getAllEstimations,
  getTotalEstimationRevenue,
  createEstimate,
  updateEstimate,
  deleteEstimate,
  getContractorEstimateByTime,
  submitEstimateToCustomer,
  getTotalRevenue
};
