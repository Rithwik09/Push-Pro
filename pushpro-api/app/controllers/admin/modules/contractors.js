const UserServices = require("../../../services/user");
const catchAsyncError = require("../../../helpers/catch-async-error");
const {
  ValidationError,
  ServerError,
  NotFoundError
} = require("../../../errors/CustomError");
const db = require("../../../../models");

const getContractors = catchAsyncError(async (req, res) => {
  try {
    const contractors = await UserServices.getAllContractors();
    const data = contractors.map((contractor) => {
      return {
        id: contractor.id,
        first_name: contractor.first_name,
        last_name: contractor.last_name,
        email_address: contractor.email_address,
        phone_no: contractor.phone_no,
        status: contractor.status
      };
    });
    res.status(200).json({
      success: true,
      data: data,
      message: "Contractors fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new CustomError(
      `Cannot Get Contractors: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractorById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const contractor = await UserServices.getContractorById({
      id: id,
      is_contractor: true
    });
    if (!contractor) throw new CustomError("Contractor not found");
    res.status(200).json({
      success: true,
      data: contractor,
      message: "Contractor fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new CustomError(
      `Cannot Get Contractor: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const deleteContractorById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const deleteContractor = await UserServices.deleteContractor({
      where: { id: id, is_contractor: true }
    });
    if (!deleteContractor) {
      throw new ServerError("Cannot Delete User");
    }
    res.status(200).json({
      success: true,
      data: deleteContractor,
      message: "Contractor deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Delete User: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getDetailsById = catchAsyncError(async (req, res) => {
  try {
    const userId = req.params.id;
    const companyDetails = await UserServices.getCompanyDetails(userId, [
      "id",
      "user_id"
    ]);
    if (!companyDetails || Object.keys(companyDetails).length === 0) {
      throw new NotFoundError("Company Details not found");
    }
    const servicesData = await db.ContractorServices.findAll({
      where: { user_id: userId }
    });
    const serviceIds = servicesData.map((service) => service.service_id);
    companyDetails.services = serviceIds;
    res.status(200).json({
      success: true,
      data: companyDetails,
      message: "Company Details fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Company Details: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getSocialLinksById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    let linksData = await UserServices.getSocialLinks(id, ["id", "user_id"]);
    if (!linksData || linksData.length === 0) {
      linksData = [];
    }
    res.status(200).json({
      success: true,
      data: linksData,
      message: "Social Links fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Social Links: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getInsuranceById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const insurance = await UserServices.getInsuranceById(id, [
      "id",
      "user_id"
    ]);
    if (!insurance) throw new NotFoundError("Insurance Not found");
    res.status(200).json({
      success: true,
      data: insurance,
      message: "Insurance fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot get Insurance: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getLicenseById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const license = await UserServices.getLicenseById(id, ["id", "user_id"]);
    if (!license) throw new NotFoundError("License Not found");
    res.status(200).json({
      success: true,
      data: license,
      message: "License fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot get License: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getCertificateById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const certificate = await UserServices.getCertificateById(id, [
      "id",
      "user_id"
    ]);
    if (!certificate) throw new NotFoundError("Certificate Not found");
    res.status(200).json({
      success: true,
      data: certificate,
      message: "Certificate fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot get Certificate: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractorBranding = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const branding = await UserServices.getContractorBrandingById(id, [
      "id",
      "user_id"
    ]);
    if (!branding) throw new NotFoundError("Branding Not found");
    res.status(200).json({
      success: true,
      data: branding,
      message: "Branding fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot get Branding: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getContractors,
  getDetailsById,
  getContractorById,
  deleteContractorById,
  getSocialLinksById,
  getInsuranceById,
  getLicenseById,
  getCertificateById,
  getContractorBranding
};
