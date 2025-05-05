const EmailTemplateService = require("../../../services/admin/email_template");
const catchAsyncError = require("../../../helpers/catch-async-error");
const { CustomError, ServerError, ValidationError } = require("../../../errors/CustomError");
const validator = require("validator");

const getEmailTemplates = catchAsyncError(async (req, res) => {
  try {
    const emailTemplates = await EmailTemplateService.getEmailTemplates();
    res.status(200).json({
      success: true,
      data: emailTemplates,
      message: "Email Templates fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Email Templates: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const addEmailTemplate = catchAsyncError(async (req, res) => {
  try {
    const {
      name,
      subject,
      emailBody
    } = req.body;
    if(!name || !subject || !emailBody) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "All fields are required",
        errors: []
      });
    }
    const emailTemplate = await EmailTemplateService.addEmailTemplate({
      name,
      subject,
      email_body: emailBody
    });
    res.status(200).json({
      success: true,
      data: emailTemplate,
      message: "Email Template added successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Add Email Template: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateEmailTemplate = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      subject,
      emailBody
    } = req.body;
    const emailTemplate = await EmailTemplateService.updateEmailTemplate(id, {
      name,
      subject,
      email_body: emailBody
    });
    res.status(200).json({
      success: true,
      data: emailTemplate,
      message: "Email Template updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Email Template: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getEmailById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const emailTemplate = await EmailTemplateService.getEmailById(id);
    res.status(200).json({
      success: true,
      data: emailTemplate,
      message: "Email Template fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Email Template: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const deleteEmailTemplate = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const emailTemplate = await EmailTemplateService.deleteEmailTemplate(id);
    res.status(200).json({
      success: true,
      data: emailTemplate,
      message: "Email Template deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Delete Email Template: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getEmailTemplates,
  addEmailTemplate,
  updateEmailTemplate,
  getEmailById,
  deleteEmailTemplate
}