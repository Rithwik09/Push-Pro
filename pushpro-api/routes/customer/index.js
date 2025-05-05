const express = require("express");
const router = express.Router();
const {
  registerResponseMessage,
  accountVerification
} = require("../../app/controllers/register");
const {
  loginResponse,
  logoutResponse,
  forgotPasswordResponse,
  customerForgotPassword,
  resetPasswordResponse,
  resetPassword
} = require("../../app/controllers/login");
const {
  customerLogin,
  resendcustomerverification
} = require("../../app/controllers/customer/login");
const {
  customerRegister,
  customerExistingRegister
} = require("../../app/controllers/customer/register");
const {
  getCustomerProjects,
  getDashboardProjectStatuses,
  createProject,
  getProjectById,
  updateProjectDatePreference,
  updateProjectBudgetPreference,
  updateProjectType,
  updateProjectCategory,
  deleteProject,
  projectVerifyAndSubmit,
  updateProjectDescription
} = require("../../app/controllers/customer/project/project");
const {
  getProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  updateProfile,
  changePassword,
  updateJoyride,
  getJoyride
} = require("../../app/controllers/customer/profile/profile");
const { checkCustomerLogin } = require("../../app/middlewares/auth");
const {
  getCompanyBrandings
} = require("../../app/controllers/customer/profile/branding");
const {
  getServices,
  getProjectServices,
  getCustomerContractorServices,
  createProjectServices
} = require("../../app/controllers/service");
const { getAllStates } = require("../../app/controllers/state");
const {
  getAreas,
  getProjectAreas,
  createProjectAreas
} = require("../../app/controllers/area");
const {
  getProjectDocuments,
  getProjectDocumentById,
  createProjectDocument,
  updateProjectDocument,
  deleteProjectDocument
} = require("../../app/controllers/customer/project/document");
const {
  getProjectCommunications,
  createProjectCommunication,
  getChatAndProjectTitle
} = require("../../app/controllers/customer/project/projectCommunications");
const {
  getQuickNotification,
  getNotificationList,
  updateNotificationById,
  createNotification
} = require("../../app/controllers/customer/notification/notifications");
const {
  getNotificationType
} = require("../../app/controllers/customer/notification/notificationType");
const { uploadS3 } = require("../../app/middlewares/s3UploadMiddleware");
const {
  getCustomersWithMultipleContractors
} = require("../../app/controllers/customer/customer_contractor/contractor_list");
const {
  getMyAddressBook,
  createAddress,
  updateAddress,
  deleteAddress
} = require("../../app/controllers/customer/profile/address_book");
const {
  getCustomerSchedules,
  getProjectSchedules,
  createProjectSchedule,
  updateProjectSchedule,
  deleteProjectSchedule,
  updateScheduleStatus,
  getDashboardSchedules
} = require("../../app/controllers/customer/project/schedule");
const {
  getEstimationById,
  getEstimationItems,
  getEstimationByUuid,
  getContractorProfileById,
  getContractorCompanyDetails,
  estimateAccepted,
  estimateRejected
} = require("../../app/controllers/customer/project/estimate");

// Public Pre-view Routes
router.get("/preview-estimate/:id", getEstimationByUuid);

// GET routes
router.get("/register", registerResponseMessage);
router.get("/login", loginResponse);
router.get("/get-contractor-branding/:id", getCompanyBrandings);
router.get("/services", checkCustomerLogin, getServices);
router.get("/services/:project_id", checkCustomerLogin, getProjectServices);
router.get("/states", checkCustomerLogin, getAllStates);
router.get("/account-activation/:id", accountVerification);
router.get("/forgot-password", forgotPasswordResponse);
router.get("/reset-password", resetPasswordResponse);
router.get("/reset-password/:token", resetPasswordResponse);
router.get("/myprofile", checkCustomerLogin, getProfile);
router.get(
  "/project-statuses/:id",
  checkCustomerLogin,
  getDashboardProjectStatuses
);
router.get(
  "/myprojects/documents/:id",
  checkCustomerLogin,
  getProjectDocuments
);
router.get("/project/:id", checkCustomerLogin, getProjectById);
router.get("/document/:id", checkCustomerLogin, getProjectDocumentById);
router.get("/areas", checkCustomerLogin, getAreas);
router.get(
  "/customerServices",
  checkCustomerLogin,
  getCustomerContractorServices
);
router.get("/areas/:project_id", checkCustomerLogin, getProjectAreas);
router.get(
  "/myprofile/notification-preferences",
  checkCustomerLogin,
  getNotificationPreferences
);
router.get("/myprofile/joyride", checkCustomerLogin, getJoyride);
router.patch("/myprofile/endtour", checkCustomerLogin, updateJoyride);
router.get(
  "/myprojects/project-verify/:id",
  checkCustomerLogin,
  projectVerifyAndSubmit
);
router.get(
  "/my-projects/project-communications/:id",
  checkCustomerLogin,
  getProjectCommunications
);
router.post(
  "/my-projects/last-chat-with-project",
  checkCustomerLogin,
  getChatAndProjectTitle
);
router.get("/notification-type", checkCustomerLogin, getNotificationType);
router.get("/quick-notification", checkCustomerLogin, getQuickNotification);
router.post("/notifications", checkCustomerLogin, getNotificationList);
router.get(
  "/contractor-list",
  checkCustomerLogin,
  getCustomersWithMultipleContractors
);

// Estimation Data Routes
router.get("/estimation/:id", checkCustomerLogin, getEstimationById);
router.get("/estimation-items/:estId", checkCustomerLogin, getEstimationItems);
router.get(
  "/profile/contractor/:id",
  checkCustomerLogin,
  getContractorProfileById
);
router.get(
  "/company-details/:id",
  checkCustomerLogin,
  getContractorCompanyDetails
);
router.patch("/accept-estimate/:id", checkCustomerLogin, estimateAccepted);
router.patch("/reject-estimate/:id", checkCustomerLogin, estimateRejected);

// POST routes
router.post("/register/:uuid", customerRegister);
router.post("/add-new-contractor/:uuid", customerExistingRegister);
router.post("/myprojects", checkCustomerLogin, getCustomerProjects);
router.post("/login/:id", customerLogin);
router.post("/resend-verification", resendcustomerverification);
router.post("/logout", logoutResponse);
router.post("/account-activation/:id", accountVerification);
router.post("/forgot-password", customerForgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/myprojects/create", checkCustomerLogin, createProject);
router.post(
  "/document/create/:id",
  checkCustomerLogin,
  uploadS3.fields([{ name: "file_url", maxCount: 1 }]),
  createProjectDocument
);
router.post(
  "/my-projects/project-communications",
  checkCustomerLogin,
  uploadS3.fields([{ name: "attachment", maxCount: 1 }]),
  createProjectCommunication
);
router.post("/create-notification", checkCustomerLogin, createNotification);
// PATCH routes
router.patch(
  "/myprofile",
  checkCustomerLogin,
  uploadS3.fields([{ name: "profile_url", maxCount: 1 }]),
  updateProfile
);
router.patch(
  "/myprofile/notification-preferences",
  checkCustomerLogin,
  updateNotificationPreferences
);
router.patch("/myprofile/change-password", checkCustomerLogin, changePassword);
router.patch(
  "/myprojects/edit/date/:id",
  checkCustomerLogin,
  updateProjectDatePreference
);
router.patch(
  "/myprojects/edit/areas/:id",
  checkCustomerLogin,
  createProjectAreas
);
router.patch(
  "/myprojects/edit/services/:id",
  checkCustomerLogin,
  createProjectServices
);
router.patch(
  "/myprojects/edit/budget/:id",
  checkCustomerLogin,
  updateProjectBudgetPreference
);
router.patch(
  "/myprojects/edit/type/:id",
  checkCustomerLogin,
  updateProjectType
);
router.patch(
  "/myprojects/edit/category/:id",
  checkCustomerLogin,
  updateProjectCategory
);
router.patch(
  "/myprojects/edit/description/:id",
  checkCustomerLogin,
  updateProjectDescription
);
router.patch(
  "/myprojects/submit/:id",
  checkCustomerLogin,
  projectVerifyAndSubmit
);
router.patch(
  "/document/update/:id",
  checkCustomerLogin,
  uploadS3.fields([{ name: "file_url", maxCount: 1 }]),
  updateProjectDocument
);
router.patch(
  "/update-notification/:id",
  checkCustomerLogin,
  updateNotificationById
);

// DELETE routes
router.delete("/myprojects/del/:id", checkCustomerLogin, deleteProject);
router.delete(
  "/document/delete/:id",
  checkCustomerLogin,
  deleteProjectDocument
);

// Project Schedule Routes
router.get("/customer-schedules/:id", checkCustomerLogin, getCustomerSchedules);
router.get("/project-schedules/:id", checkCustomerLogin, getProjectSchedules);
router.get("/my-schedules/:id", checkCustomerLogin, getDashboardSchedules);
router.post(
  "/project-schedule/create/:id",
  checkCustomerLogin,
  createProjectSchedule
);
router.patch(
  "/project-schedule/edit/:sid",
  checkCustomerLogin,
  updateProjectSchedule
);
router.patch(
  "/project-schedule/status/:sid",
  checkCustomerLogin,
  updateScheduleStatus
);
router.delete(
  "/project-schedule/delete/:sid",
  checkCustomerLogin,
  deleteProjectSchedule
);

// Address Book Routes
router.get("/myaddressbook", checkCustomerLogin, getMyAddressBook);
router.post("/addressCreate", checkCustomerLogin, createAddress);
router.patch("/myaddressbook/:id", checkCustomerLogin, updateAddress);
router.delete("/myaddressbook/:id", checkCustomerLogin, deleteAddress);

module.exports = router;
