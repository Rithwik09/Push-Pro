const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {
  registerResponseMessage,
  accountVerification
} = require("../../app/controllers/register");
const {
  getMyAddressBook,
  createAddress,
  updateAddress,
  deleteAddress
} = require("../../app/controllers/customer/profile/address_book");
const {
  loginResponse,
  logoutResponse,
  forgotPasswordResponse,
  contractorForgotPassword,
  resetPasswordResponse,
  resetPassword
} = require("../../app/controllers/login");
const {
  contractorLogin,
  resendVerification,
  getInviteTemplates,
  sendInvitationEmail,
  sendInvitationSms
} = require("../../app/controllers/contractor/login");
const {
  contractorRegister,
  subContractorRegister,
  existingSubContractorRegister
} = require("../../app/controllers/contractor/register");
const {
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
} = require("../../app/controllers/contractor/project/project");
const {
  getCustomerByName,
  addCustomerByContractor,
  getAllCustomers,
  customerAddress
} = require("../../app/controllers/contractor/customer");
const {
  getProfile,
  getNotificationPreferences,
  updateProfile,
  updateNotificationPreferences,
  changePassword,
  updateJoyride,
  getJoyride
} = require("../../app/controllers/contractor/profile/profile");
const {
  getDetails,
  updateDetails,
  getUserSocialLinks,
  updateSocialLinks,
  getContractDetails,
  updateContractDetails
} = require("../../app/controllers/contractor/profile/details");
const {
  checkContractorLogin,
  checkAccessMiddleware
} = require("../../app/middlewares/auth");
const {
  getCompanyBrandings,
  updateCompanyBrandings
} = require("../../app/controllers/contractor/profile/branding");
const { uploadS3 } = require("../../app/middlewares/s3UploadMiddleware");
const {
  getServices,
  getContractorServices
} = require("../../app/controllers/service");
const {
  getCertificates,
  addCertificate,
  editCertificate,
  removeCertificate
} = require("../../app/controllers/contractor/profile/certificates");
const { getAreas, getProjectAreas } = require("../../app/controllers/area");
const {
  getLicenses,
  addLicense,
  editLicense,
  removeLicense
} = require("../../app/controllers/contractor/profile/licenses");
const {
  getItemById,
  getLibraryItems,
  getContractorItems,
  getAllCategories,
  addItem,
  editItem,
  removeItem
} = require("../../app/controllers/contractor/items/items");
const { getAllStates } = require("../../app/controllers/state");
const {
  getInsurances,
  addInsurance,
  editInsurance,
  removeInsurance
} = require("../../app/controllers/contractor/profile/insurances");
const {
  getProjectCommunications,
  createProjectCommunication,
  getChatAndProjectTitle
} = require("../../app/controllers/contractor/project/projectCommunications");
const {
  getNotificationType
} = require("../../app/controllers/contractor/notification/notificationType");
const {
  getQuickNotification,
  getNotificationList,
  updateNotificationById,
  createNotification
} = require("../../app/controllers/contractor/notification/notifications");
const {
  getAllEstimationItemsByEstimationId,
  getEstimationItemById,
  createEstimationItem,
  updateEstimationItemPosition,
  updateEstimationItem,
  deleteEstimationItem
} = require("../../app/controllers/contractor/project/estimation_items");
const {
  getEstimationByID,
  getEstimationByProjectContractorId,
  getAllEstimations,
  getTotalEstimationRevenue,
  getTotalRevenue,
  getContractorEstimateByTime,
  createEstimate,
  updateEstimate,
  deleteEstimate,
  submitEstimateToCustomer
} = require("../../app/controllers/contractor/project/estimation");
const {
  getShortUrls,
  createShortUrl,
  createShortUrl2
} = require("../../app/controllers/contractor/short_url");
const {
  getCustomerProfileById
} = require("../../app/controllers/customer/profile/profile");
const {
  getContractorSchedules,
  getDashboardSchedules,
  getProjectSchedules,
  createProjectSchedule,
  updateProjectSchedule,
  updateScheduleStatus,
  deleteProjectSchedule
} = require("../../app/controllers/contractor/project/schedule");
const {
  getSubContractorById,
  getSubContractors,
  searchSubContractor,
  getSubContractorCount
} = require("../../app/controllers/contractor/subContractors");
const {
  getCustomersforContractor
} = require("../../app/controllers/customer/customer_contractor/contractor_list");

// GET routes
router.get("/register", registerResponseMessage);
router.get("/login", loginResponse);
router.get("/account-activation/:id", accountVerification);
router.get("/forgot-password", forgotPasswordResponse);
router.get("/reset-password", resetPasswordResponse);
router.get("/reset-password/:token", resetPasswordResponse);
router.get("/myprofile", checkContractorLogin, getProfile);
router.get("/view-customer/:id", checkContractorLogin, customerAddress);
router.get("/customers", checkContractorLogin, getCustomerByName);
router.post("/my-customers", checkContractorLogin, getAllCustomers);
router.get(
  "/projectStatuses",
  checkContractorLogin,
  getDashboardProjectStatuses
);
router.get("/get-contractor-branding/:id", getCompanyBrandings);
router.get(
  "/myprofile/notification-preferences",
  checkContractorLogin,
  getNotificationPreferences
);
router.get("/myprofile/contractor-details", checkContractorLogin, getDetails);
router.get(
  "/profile/customer/:id",
  checkContractorLogin,
  getCustomerProfileById
);
router.get("/myprofile/social-links", checkContractorLogin, getUserSocialLinks);
router.get("/myprofile/contractor-licenses", checkContractorLogin, getLicenses);
router.get(
  "/myprofile/contractor-insurances",
  checkContractorLogin,
  getInsurances
);
router.get("/project/:id", checkContractorLogin, getProjectById);
router.get("/areas", checkContractorLogin, getAreas);
router.get(
  "/view-subcontractor/:id",
  checkContractorLogin,
  getSubContractorById
);
router.get(
  "/total-subcontractors",
  checkContractorLogin,
  getSubContractorCount
);
router.get("/subContractors", checkContractorLogin, getSubContractors);
router.post("/subContractors", checkContractorLogin, searchSubContractor);
router.post("/add-customer", checkContractorLogin, addCustomerByContractor);

// POST routes
router.post("/register", contractorRegister);
router.post("/register/:uuid", subContractorRegister);
router.post("/register/existing/:uuid", existingSubContractorRegister);
router.post("/login", contractorLogin);
router.post("/resendverify", resendVerification);
router.post("/account-activation/:id", accountVerification);
router.post("/forgot-password", contractorForgotPassword);
router.post("/reset-password/:token", resetPassword);

// Invitation Emails and SMS Routes
router.get("/getTemplates", checkContractorLogin, getInviteTemplates);
router.post("/sendBulkMails", checkContractorLogin, sendInvitationEmail);
router.post("/sendBulkSms", checkContractorLogin, sendInvitationSms);

// Notification and Communication Routes
router.get(
  "/my-projects/project-communications/:id",
  checkContractorLogin,
  getProjectCommunications
);
router.get(
  "/my-projects/last-chat-with-project",
  checkContractorLogin,
  getChatAndProjectTitle
);
router.get("/notification-type", checkContractorLogin, getNotificationType);
router.get("/quick-notification", checkContractorLogin, getQuickNotification);
router.post("/notifications", checkContractorLogin, getNotificationList);
router.post(
  "/my-projects/project-communications",
  checkContractorLogin,
  uploadS3.fields([{ name: "attachment", maxCount: 1 }]),
  createProjectCommunication
);
router.patch(
  "/update-notification/:id",
  checkContractorLogin,
  updateNotificationById
);
router.post("/create-notification", checkContractorLogin, createNotification);

// Profile Routes
router.get("/myprofile", checkContractorLogin, getProfile);
router.patch(
  "/myprofile",
  checkContractorLogin,
  uploadS3.fields([{ name: "profile_url", maxCount: 1 }]),
  updateProfile
);

// PATCH routes
router.patch("/myprofile", checkContractorLogin, updateProfile);
router.get("/myprofile/joyride", checkContractorLogin, getJoyride);
router.patch("/myprofile/endtour", checkContractorLogin, updateJoyride);
router.patch(
  "/myprofile/notification-preferences",
  checkContractorLogin,
  updateNotificationPreferences
);
router.patch(
  "/myprofile/change-password",
  checkContractorLogin,
  changePassword
);
router.patch(
  "/myprofile/contractor-details/update",
  checkContractorLogin,
  updateDetails
);
router.get("/myprofile/social-links", checkContractorLogin, getUserSocialLinks);
router.patch(
  "/myprofile/social-links",
  checkContractorLogin,
  updateSocialLinks
);
router.get(
  "/myprofile/contract-text",
  checkContractorLogin,
  getContractDetails
);
router.patch(
  "/myprofile/contract-text",
  checkContractorLogin,
  updateContractDetails
);
router.patch(
  "/myprofile/contractor-branding/update",
  checkContractorLogin,
  uploadS3.fields([
    { name: "main_logo", maxCount: 1 },
    { name: "toggle_logo", maxCount: 1 },
    { name: "main_logo_dark", maxCount: 1 },
    { name: "toggle_logo_dark", maxCount: 1 },
    { name: "right_section_image", maxCount: 1 }
  ]),
  updateCompanyBrandings
);

// Contractor Certificate Routes
router.get(
  "/myprofile/contractor-certificates",
  checkContractorLogin,
  getCertificates
);
router.post(
  "/myprofile/contractor-certificate/add",
  checkContractorLogin,
  uploadS3.fields([
    {
      name: "certificate_url",
      maxCount: 1
    }
  ]),
  addCertificate
);
router.patch(
  "/myprofile/contractor-certificate/update/:id",
  checkContractorLogin,
  uploadS3.fields([
    {
      name: "certificate_url",
      maxCount: 1
    }
  ]),
  editCertificate
);
router.delete(
  "/myprofile/contractor-certificate/delete/:id",
  checkContractorLogin,
  removeCertificate
);

// Contractor License Routes
router.get("/myprofile/contractor-licenses", checkContractorLogin, getLicenses);
router.post(
  "/myprofile/license/add",
  checkContractorLogin,
  uploadS3.fields([
    {
      name: "license_url",
      maxCount: 1
    }
  ]),
  addLicense
);
router.patch(
  "/myprofile/contractor-license/update/:id",
  checkContractorLogin,
  uploadS3.fields([
    {
      name: "license_url",
      maxCount: 1
    }
  ]),
  editLicense
);
router.delete(
  "/myprofile/contractor-license/delete/:id",
  checkContractorLogin,
  removeLicense
);

// Contractor Insurance Routes
router.get(
  "/myprofile/contractor-insurances",
  checkContractorLogin,
  getInsurances
);
router.post(
  "/myprofile/contractor-insurance/add",
  checkContractorLogin,
  uploadS3.fields([{ name: "insurance", maxCount: 1 }]),
  addInsurance
);
router.patch(
  "/myprofile/contractor-insurance/update/:id",
  checkContractorLogin,
  uploadS3.fields([
    {
      name: "insurance",
      maxCount: 1
    }
  ]),
  editInsurance
);
router.delete(
  "/myprofile/contractor-insurance/delete/:id",
  checkContractorLogin,
  removeInsurance
);

// Project Routes
router.get("/project/:id", checkContractorLogin, getProjectById);
router.post("/myprojects", checkContractorLogin, getContractorProjects);
router.post(
  "/myprojects/create",
  checkContractorLogin,
  contractorCreateProject
);
router.post(
  "/myprojectsByTime",
  checkContractorLogin,
  getContractorProjectByTime
);
router.post(
  "/getestimatebytime",
  checkContractorLogin,
  getContractorEstimateByTime
);
router.patch(
  "/myprojects/edit/type/:id",
  checkContractorLogin,
  contractorProjectType
);
router.patch(
  "/myprojects/edit/areas/:id",
  checkContractorLogin,
  contractorProjectAreas
);
router.delete(
  "/document/delete/:id",
  checkContractorLogin,
  deleteContractorProjectDocument
);
router.patch(
  "/myprojects/edit/services/:id",
  checkContractorLogin,
  contractorProjectServices
);
router.patch(
  "/myprojects/edit/category/:id",
  checkContractorLogin,
  contractorProjectCategory
);
router.patch(
  "/myprojects/project-submit/:id",
  checkContractorLogin,
  contractorProjectVerifyAndSubmit
);
router.patch(
  "/myprojects/edit/date/:id",
  checkContractorLogin,
  contractorProjectDatePreference
);
router.patch(
  "/myprojects/edit/description/:id",
  checkContractorLogin,
  contractorProjectDescription
);
router.patch(
  "/myprojects/edit/budget/:id",
  checkContractorLogin,
  contractorProjectBudgetPreference
);
router.post(
  "/document/create/:id",
  checkContractorLogin,
  uploadS3.fields([{ name: "file_url", maxCount: 1 }]),
  contractorProjectDocument
);

// State Routes
router.get("/states", checkContractorLogin, getAllStates);

// Project Services Routes
router.get("/services", checkContractorLogin, getServices);
router.get("/services/contractor", checkContractorLogin, getContractorServices);

// Project Areas Routes
router.get("/areas", checkContractorLogin, getAreas);
router.get("/areas/:project_id", checkContractorLogin, getProjectAreas);

// Items and Item Categories Routes
router.get(
  "/myprofile/all-item-categories",
  checkContractorLogin,
  getAllCategories
);
router.get("/myprofile/item/:id", checkContractorLogin, getItemById);
router.post("/projects/library-items", checkContractorLogin, getLibraryItems);
router.post(
  "/myprofile/contractor-items",
  checkContractorLogin,
  getContractorItems
);
router.post("/myprofile/item/add", checkContractorLogin, addItem);
router.patch("/myprofile/item/edit/:id", checkContractorLogin, editItem);
router.delete("/myprofile/item/del/:id", checkContractorLogin, removeItem);

// Estimation Routes
router.get(
  "/myprojects/estimation/:id",
  checkContractorLogin,
  checkAccessMiddleware,
  getEstimationByID
);
router.get("/total-estimates", checkContractorLogin, getTotalEstimationRevenue);
router.get("/total-revenue", checkContractorLogin, getTotalRevenue);
router.get(
  "/project/estimation/:pid",
  checkContractorLogin,
  checkAccessMiddleware,
  getEstimationByProjectContractorId
);
router.get("/customercounts", checkContractorLogin, getCustomersforContractor);
router.post("/myprojects/estimations", checkContractorLogin, getAllEstimations);
router.post(
  "/myprojects/estimation/create/:pid",
  checkContractorLogin,
  checkAccessMiddleware,
  createEstimate
);
router.post(
  "/myprojects/estimation/submit/:id",
  checkContractorLogin,
  checkAccessMiddleware,
  upload.single("estimation_file"),
  submitEstimateToCustomer
);
// (req, res, next) => {
//   console.log("Route hit for estimation creation.");
//   next();
// }, to log that route is hit or not.

//Updated To Handle Contract Text
router.patch(
  "/myprojects/estimation/edit/:id",
  checkContractorLogin,
  checkAccessMiddleware,
  updateEstimate
);
router.delete(
  "/myprojects/estimation/del/:id",
  checkContractorLogin,
  checkAccessMiddleware,
  deleteEstimate
);

// Estimation Items Routes
router.get(
  "/myprojects/estimation/item/:id",
  checkContractorLogin,
  checkAccessMiddleware,
  getEstimationItemById
);
router.get(
  "/myprojects/estimation/all-items/:eid",
  checkContractorLogin,
  checkAccessMiddleware,
  getAllEstimationItemsByEstimationId
);
router.post(
  "/myprojects/estimation/item/add/:eid",
  checkContractorLogin,
  checkAccessMiddleware,
  createEstimationItem
);
router.patch(
  "/myprojects/estimation/item/position/:eid",
  checkContractorLogin,
  updateEstimationItemPosition
);
router.patch(
  "/myprojects/estimation/item/edit/:eid",
  checkContractorLogin,
  updateEstimationItem
);
router.delete(
  "/myprojects/estimation/item/del/:id",
  checkContractorLogin,
  deleteEstimationItem
);

// Logout Route
router.post("/logout", logoutResponse);

// Short Url
router.get("/short-url", checkContractorLogin, getShortUrls);
router.post("/short-url", checkContractorLogin, createShortUrl);
router.post("/short-url2", checkContractorLogin, createShortUrl2);

// Project Schedule Routes
router.get(
  "/contractor-schedules/:id",
  checkContractorLogin,
  getContractorSchedules
);
router.get("/dashboard-schedules", checkContractorLogin, getDashboardSchedules);
router.get("/project-schedules/:id", checkContractorLogin, getProjectSchedules);
router.post(
  "/project-schedule/create/:id",
  checkContractorLogin,
  createProjectSchedule
);
router.patch(
  "/project-schedule/edit/:sid",
  checkContractorLogin,
  updateProjectSchedule
);
router.patch(
  "/project-schedule/status/:sid",
  checkContractorLogin,
  updateScheduleStatus
);
router.delete(
  "/project-schedule/delete/:sid",
  checkContractorLogin,
  deleteProjectSchedule
);

// Address Book Routes
router.get("/addressBook", checkContractorLogin, getMyAddressBook);
router.post("/create-address", checkContractorLogin, createAddress);
router.patch("/update-address/:id", checkContractorLogin, updateAddress);
router.delete("/delete-address/:id", checkContractorLogin, deleteAddress);

// Export the router
module.exports = router;
