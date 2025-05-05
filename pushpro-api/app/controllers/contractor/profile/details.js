const UserServices = require("../../../services/user");
const db = require("../../../../models");
const CompanyDetailsServices = require("../../../services/contractor/companyDetails");
const validator = require("validator");
const {
  ValidationError,
  ServerError,
  NotFoundError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");

const getDetails = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const companyDetails = await UserServices.getCompanyDetails(userId, [
      "id",
      "user_id"
    ]);
    if (!companyDetails || Object.keys(companyDetails).length === 0) {
      res.status(200).json({
        success: true,
        data: null,
        message: "Company Details Not Found",
        errors: []
      });
    } else {
      const servicesData = await db.ContractorServices.findAll({
        where: { user_id: req.user.id }
      });
      const serviceIds = servicesData.map((service) => service.service_id);
      companyDetails.services = serviceIds;
      res.status(200).json({
        success: true,
        data: companyDetails,
        message: "Company Details fetched successfully",
        errors: []
      });
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.status).json(error.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Get Company Details: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateDetails = catchAsyncError(async (req, res) => {
  const {
    company_name,
    phone_no,
    address_line_1,
    address_line_2,
    city,
    state,
    country,
    zip_code,
    business_id,
    company_email,
    services = []
  } = req.body;
  const detailsData = {
    company_name,
    phone_no,
    address_line_1,
    address_line_2,
    city,
    state,
    country,
    zip_code,
    business_id,
    company_email,
    updatedAt: new Date()
  };
  try {
    if (company_email && !validator.isEmail(company_email)) {
      throw new ValidationError("Invalid email address");
    }
    if (zip_code && !validator.isPostalCode(zip_code, "any")) {
      throw new ValidationError("Invalid zip code");
    }
    let companyDetails = await UserServices.getCompanyDetails(req.user.id);
    if (!companyDetails) {
      detailsData.user_id = req.user.id;
      companyDetails = await db.CompanyDetails.create(detailsData);
    } else {
      const [updatedRowCount] = await db.CompanyDetails.update(detailsData, {
        where: { user_id: req.user.id }
      });
      companyDetails = await UserServices.getCompanyDetails(req.user.id, [
        "id",
        "user_id",
        "createdAt",
        "updatedAt"
      ]);
      if (updatedRowCount === 0) {
        throw new ValidationError("Failed to update company details");
      }
    }
    if (!companyDetails || Object.keys(companyDetails).length === 0) {
      throw new NotFoundError("Company Details not found");
    }
    await db.ContractorServices.destroy({
      where: { user_id: req.user.id }
    });
    for (const serviceId of services) {
      const parsedServiceId = parseInt(serviceId);
      if (!isNaN(parsedServiceId)) {
        await db.ContractorServices.create({
          user_id: req.user.id,
          service_id: parsedServiceId
        });
      }
    }
    const updatedServicesData = await db.ContractorServices.findAll({
      where: { user_id: req.user.id }
    });
    companyDetails.services = updatedServicesData.map(
      (service) => service.service_id
    );
    res.status(200).json({
      success: true,
      data: companyDetails,
      message: "Company Details updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Company Details: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getUserSocialLinks = catchAsyncError(async (req, res) => {
  try {
    let linksData = await UserServices.getSocialLinks(req.user.id, [
      "id",
      "user_id"
    ]);
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
    const serverError = new ServerError(error.message);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateSocialLinks = catchAsyncError(async (req, res) => {
  const { social_links } = req.body;
  try {
    if (!social_links) {
      throw new ValidationError("Social links data is required");
    }
    const socialLinksData = { social_links, updatedAt: new Date() };
    let socialLinks = await UserServices.getSocialLinks(req.user.id);
    if (!socialLinks) {
      socialLinks = await UserServices.setSocialLinks(
        req.user.id,
        socialLinksData
      );
    } else {
      socialLinks = await UserServices.updateSocialLinks(
        req.user.id,
        socialLinksData
      );
    }
    socialLinks = await UserServices.getSocialLinks(req.user.id, [
      "id",
      "user_id"
    ]);
    res.status(200).json({
      success: true,
      data: socialLinks,
      message: "Social Links updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Social Links: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractDetails = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const details = await CompanyDetailsServices.getCompanyDetails(userId);
    res.status(200).json({
      success: true,
      data: details.contract_text || "",
      message: "Contract Details fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(error.message);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateContractDetails = catchAsyncError(async (req, res) => {
  const { contract_text } = req.body;
  try {
    const userId = req.user.id;
    const contractor = await UserServices.getContractor({ id: userId });
    if (!contractor) throw new ValidationError("User Not Found");
    if (!contract_text) {
      throw new ValidationError("Contract Text Required");
    }
    let companyDetails = await CompanyDetailsServices.getCompanyDetails(userId);
    if (!companyDetails) {
      companyDetails = await CompanyDetailsServices.createDetails(
        userId,
        contract_text
      );
      await companyDetails.save();
    } else {
      companyDetails = await CompanyDetailsServices.updateDetails(
        userId,
        contract_text
      );
    }
    companyDetails = await CompanyDetailsServices.getCompanyDetails(userId);
    res.status(200).json({
      success: true,
      data: companyDetails,
      message: "Contract Details Updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Contract Details: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getDetails,
  updateDetails,
  getUserSocialLinks,
  updateSocialLinks,
  getContractDetails,
  updateContractDetails
};
