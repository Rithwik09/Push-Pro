const UserServices = require("../../services/user");
const catchAsyncError = require("../../helpers/catch-async-error");
const { NotFoundError, ServerError } = require("../../errors/CustomError");
const ContractorServices = require("../../services/contractor/contractorServices");
const BrandingServices = require("../../services/contractor/brandingServices");
const LicenseServices = require("../../services/contractor/licenseServices");
const InsuranceServices = require("../../services/contractor/insuranceServices");
const CertificateServices = require("../../services/contractor/certificateServices");

const getSubContractorById = catchAsyncError(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const [contractor, subcontractor] = await Promise.all([
      UserServices.checkRelationContractorSubContractor(userId, id),
      UserServices.checkRelationContractorSubContractor(id, userId)
    ]);
    if (!contractor && !subcontractor) {
      res.status(200).json({
        success: true,
        data: [],
        message: "No Data Found",
        errors: []
      });
    }
    let subContractorDetails = await fetchContractorDetails(id);
    const branding = await BrandingServices.getBranding(id);
    const licenses = await LicenseServices.getUserLicenses(id);
    const insurances = await InsuranceServices.getUserInsurances(id);
    const certificates = await CertificateServices.getUserCertificates(id);
    const filteredLicenses = licenses
      .filter((license) => license.visible_on_profile)
      .map((license) => ({
        service_id: license.service_id,
        license_number: license.license_number,
        nationwide: license.nationwide,
        license_states: license.license_states,
        license_url: license.license_url,
        expiration_date: license.expiration_date
      }));
    const filteredInsurances = insurances
      .filter((insurance) => insurance.visible_on_profile)
      .map((insurance) => ({
        title: insurance.title,
        insurance_url: insurance.insurance_url,
        expiration_date: insurance.expiration_date
      }));
    const filteredCertificates = certificates
      .filter((certificate) => certificate.visible_on_profile)
      .map((certificate) => ({
        title: certificate.title,
        certificate_url: certificate.certificate_url
      }));
    subContractorDetails = {
      ...subContractorDetails,
      logo: branding ? branding.main_logo : null,
      licenses: filteredLicenses || [],
      insurances: filteredInsurances || [],
      certificates: filteredCertificates || []
    };
    res.status(200).json({
      success: true,
      message: "SubContractor Fetched Successfully",
      data: subContractorDetails,
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get SubContractor By Id : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getSubContractorCount = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const checkcontractor = await UserServices.getContractor(userId);
    if (!checkcontractor.is_contractor) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "Not a Contractor",
        errors: []
      });
    }
    const data = await UserServices.findSubContractorByContractorId(userId);
    res.status(200).json({
      success: true,
      data: data.length || 0,
      message: data.length
        ? "SubContractors Data Fetched Successfully"
        : "No SubContractors Found",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get SubContractor Count : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getSubContractors = catchAsyncError(async (req, res) => {
  const userId = req.user.id;
  try {
    const [contractors, subContractors] = await Promise.all([
      UserServices.findContractorSubContractorRelations({ user_id: userId }),
      UserServices.findContractorSubContractorRelations({
        contractor_id: userId
      })
    ]);
    if (!contractors.length && !subContractors.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No Contractors / SubContractors Found",
        errors: []
      });
    }
    const contractorIds = [
      ...contractors.map((c) => c.contractor_id),
      ...subContractors.map((sc) => sc.user_id)
    ];
    const uniqueContractorIds = [...new Set(contractorIds)];
    const contractorDetails = await Promise.all(
      uniqueContractorIds.map(fetchContractorDetails)
    );
    res.status(200).json({
      success: true,
      message: "My Contractors Fetched Successfully",
      data: contractorDetails,
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get SubContractors: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

async function fetchContractorDetails(contractorId) {
  const [contractor, companyDetails, contractorServices] = await Promise.all([
    UserServices.getContractor({ id: contractorId }),
    UserServices.getCompanyDetails(contractorId),
    ContractorServices.getServicesByContractorId(contractorId)
  ]);
  return {
    name: `${contractor?.first_name || ""} ${contractor?.last_name || ""}`,
    email: contractor?.email_address || "",
    companyDetails: companyDetails ? formatCompanyDetails(companyDetails) : "",
    services: contractorServices?.map((service) => service.service_id),
    id: contractor?.id || ""
  };
}

function formatCompanyDetails(details) {
  if (!details) return null;
  const {
    company_name,
    address_line_1,
    address_line_2,
    city,
    state,
    country,
    zip_code,
    phone_no,
    company_email
  } = details;
  return {
    name: company_name || "",
    address:
      [address_line_1, address_line_2, city, state, country, zip_code]
        .filter(Boolean)
        .join(", ") || "",
    phone_no: phone_no || "",
    email: company_email || ""
  };
}

const searchSubContractor = catchAsyncError(async (req, res) => {
  const userId = req.user.id;
  const { name, services } = req.body;
  try {
    const [contractors, subContractors] = await Promise.all([
      UserServices.findContractorSubContractorRelations({ user_id: userId }),
      UserServices.findContractorSubContractorRelations({
        contractor_id: userId
      })
    ]);
    const associatedContractorIds = [
      ...contractors.map((contractor) => contractor.contractor_id),
      ...subContractors.map((subContractor) => subContractor.user_id)
    ];
    let filteredContractors = [];
    if (name) {
      const contractorsByName = await UserServices.searchContractorsByName(
        name,
        associatedContractorIds
      );
      filteredContractors = contractorsByName;
    }
    if (services && services.length > 0) {
      const contractorsByServices =
        await ContractorServices.searchContractorsByServices(
          services,
          associatedContractorIds
        );
      filteredContractors = filteredContractors.concat(contractorsByServices);
    }
    const uniqueFilteredContractors = [
      ...new Set(filteredContractors.map((contractor) => contractor.id))
    ].map((id) =>
      filteredContractors.find((contractor) => contractor.id === id)
    );
    const contractorDetails = await Promise.all(
      uniqueFilteredContractors.map((contractor) =>
        fetchContractorDetails(contractor.id)
      )
    );
    res.status(200).json({
      success: true,
      message: "SubContractors Fetched Successfully",
      data: contractorDetails || [],
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Search SubContractors: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getSubContractorById,
  getSubContractors,
  searchSubContractor,
  getSubContractorCount
};
