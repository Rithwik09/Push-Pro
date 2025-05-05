const express = require("express");
const router = express.Router();
const { checkAdminLogin, checkAdminLoginWithoutPermissions } = require("../../app/middlewares/auth");
const {
  adminLogin,
  adminForgotPassword,
  resetPassword
} = require("../../app/controllers/admin/login");

const {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword
} = require("../../app/controllers/admin/profile/profile");

const {
  getSystemModules
} = require("../../app/controllers/admin/modules/system_modules");

const {
  getAdminUsers,
  addAdminUser,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser
} = require("../../app/controllers/admin/modules/user_management");

const {
  addRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole
} = require("../../app/controllers/admin/modules/user_management");

const {
  getContractors,
  getContractorById,
  deleteContractorById,
  getDetailsById,
  getSocialLinksById,
  getInsuranceById,
  getLicenseById,
  getCertificateById,
  getContractorBranding
} = require("../../app/controllers/admin/modules/contractors");

const {
  getCustomers,
  getCustomerById,
  deleteCustomerById
} = require("../../app/controllers/admin/modules/customers");

const {
  getTotalCustomers,
  getTotalContractors,
  getTotalPayment,
  getTotalInvoice
} = require("../../app/controllers/admin/modules/dashboard");

const {
  getAllProjects,
  getProjectById
} = require("../../app/controllers/admin/modules/project_management");

const {
  getEmailTemplates,
  addEmailTemplate,
  updateEmailTemplate,
  getEmailById,
  deleteEmailTemplate
} = require("../../app/controllers/admin/modules/email-template");

const { 
  getAllSystemModules,
  assignPermissions
} = require("../../app/controllers/admin/modules/manage_roles");

router.post("/login", adminLogin);
router.post("/forgot-password", adminForgotPassword);
router.post("/reset-password/:token", resetPassword);

// Profile Routes
router.get("/myprofile", checkAdminLogin, getAdminProfile);
router.patch(
  "/myprofile",
  checkAdminLogin,
  updateAdminProfile
);
router.patch(
  "/myprofile/change-password",
  checkAdminLogin,
  changeAdminPassword
);

// User Management Routes
router.get("/admin-users", checkAdminLogin, getAdminUsers);
router.post("/admin-users/create", checkAdminLogin, addAdminUser);
router.patch("/update-admin-user/:id", checkAdminLogin, updateAdminUser);
router.delete("/delete-admin-user/:id", checkAdminLogin, deleteAdminUser);

// Role Management Routes
router.post("/add-role", checkAdminLogin, addRole);
router.post("/role/:id", checkAdminLogin, getRoleById);
router.patch("/update-role/:id", checkAdminLogin, updateRole);
router.delete("/delete-role/:id", checkAdminLogin, deleteRole);

// System Modules
router.get("/roles", checkAdminLoginWithoutPermissions, getRoles);
router.get("/system-modules", checkAdminLoginWithoutPermissions, getSystemModules);
router.post("/admin-user/:id", checkAdminLoginWithoutPermissions, getAdminUserById);

// Contractors
router.get("/contractors", checkAdminLogin, getContractors);
router.delete("/delete-contractor/:id", checkAdminLogin, deleteContractorById);
router.post("/contractor/:id", checkAdminLogin, getContractorById);
router.post("/contractor/details/:id", checkAdminLogin, getDetailsById);
router.post("/contractor/social-links/:id", checkAdminLogin, getSocialLinksById);
router.post("/contractor/insurance/:id", checkAdminLogin, getInsuranceById);
router.post("/contractor/license/:id", checkAdminLogin, getLicenseById);
router.post("/contractor/certificate/:id", checkAdminLogin, getCertificateById);
router.post("/contractor/branding/:id", checkAdminLogin, getContractorBranding);

// Customers
router.get("/customers", checkAdminLogin, getCustomers);
router.post("/customer/:id", checkAdminLogin, getCustomerById);
router.delete("/delete-customer/:id", checkAdminLogin, deleteCustomerById);

// Projects
router.post("/projects", checkAdminLogin, getAllProjects);
router.post("/project/:id", checkAdminLogin, getProjectById);

// Dashboard
router.get("/total-customers", checkAdminLogin, getTotalCustomers);
router.get("/total-contractors", checkAdminLogin, getTotalContractors);
router.get("/total-payment", checkAdminLogin, getTotalPayment);
router.get("/total-invoice", checkAdminLogin, getTotalInvoice);

// Email Templates
router.get("/email-templates", checkAdminLogin, getEmailTemplates);
router.post("/email-template/add", checkAdminLogin, addEmailTemplate);
router.patch("/email-template/update/:id", checkAdminLogin, updateEmailTemplate);
router.post("/email-template/:id", checkAdminLogin, getEmailById);
router.delete("/email-template/delete/:id", checkAdminLogin, deleteEmailTemplate);

// get system module
router.get("/get-system-modules", checkAdminLogin, getAllSystemModules);
// router.post("/admin-roles/assign-permissions/:id", checkAdminLogin, assignPermissoins);
router.post('/admin-roles/:roleId/assign-permissions', checkAdminLogin, assignPermissions);

// Export the router
module.exports = router;
