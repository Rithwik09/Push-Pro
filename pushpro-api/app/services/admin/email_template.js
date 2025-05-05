require("dotenv").config();
const { ValidationError, NotFoundError } = require("../../errors/CustomError");
const db = require("../../../models");

class EmailTemplateService {
  static async getEmailTemplates() {
    const emailTemplates = await db.EmailTemplates.findAll();
    if (!emailTemplates) {
      throw new NotFoundError("Email Templates not found");
    }
    return emailTemplates;
  }

  static async addEmailTemplate({ name, subject, email_body }) {
    const emailTemplate = await db.EmailTemplates.create({
      name,
      subject,
      email_body
    });
    return emailTemplate;
  }

  static async updateEmailTemplate(id, { name, subject, email_body }) {
    const emailTemplate = await db.EmailTemplates.update(
      {
        name,
        subject,
        email_body
      },
      {
        where: {
          id
        }
      }
    );
    return emailTemplate;
  }

  static async getEmailById(id) {
    const emailTemplate = await db.EmailTemplates.findOne({
      where: {
        id
      }
    });
    if (!emailTemplate) {
      throw new NotFoundError("Email Template not found");
    }
    return emailTemplate;
  }

  static async deleteEmailTemplate(id) {
    const emailTemplate = await db.EmailTemplates.destroy({
      where: {
        id
      }
    });
    return emailTemplate;
  }
}

module.exports = EmailTemplateService;
