require("dotenv").config();
const db = require("../../models");
const { v4: uuidv4 } = require("uuid");
const { sendEmail, sendSms } = require("../helpers/sendMail");
const UserServices = require("./user");
const AdminUserServices = require("./admin/user");

class EmailServices {
  static async getTemplateByName(templateName) {
    return await db.EmailTemplates.findOne({
      where: { name: templateName }
    });
  }

  // static async getTemplateByNameAndLanguage(templateName, language) {
  //   return await db.EmailTemplates.findOne({
  //     where: { name: templateName, lang: language }
  //   });
  // }

  static async sendCustomerActivationEmail(email_address) {
    const user = await UserServices.getUser({ email_address });
    const accountActivationTemplate = await this.getTemplateByName(
      "ACCOUNT_ACTIVATION"
    );
    if (!accountActivationTemplate) {
      throw new Error("Email template not found");
    }
    if (!user.verification_code || user.verification_code === null) {
      user.verification_code = uuidv4().toString();
      await user.save();
    }
    const activationLink = `${process.env.BASE_URL_CUSTOMER}/account-activation/${user.verification_code}`;
    const emailBody = accountActivationTemplate.email_body
      .replace(/\[NAME\]/g, `${user.first_name} ${user.last_name}`)
      .replace(/\[ACCOUNT_ACTIVATION_LINK\]/g, activationLink);
    try {
      await sendEmail({
        to: user.email_address,
        subject: accountActivationTemplate.subject,
        message: "",
        body: emailBody
      });
      await sendSms(
        user.phone_no,
        `Click To Activate Your Account: ${activationLink}`
      );
      return true;
    } catch (error) {
      console.error("Error Sending Activation Email and SMS : ", error);
    }
  }

  static async sendCustomerPasswordDetails(
    email_address,
    password,
    contractorName
  ) {
    const user = await UserServices.getUser({ email_address });
    const accountActivationTemplate = await this.getTemplateByName(
      "ACCOUNT_CREATION_BY_CONTRACTOR"
    );
    if (!accountActivationTemplate) {
      throw new Error("Email template not found");
    }
    const activationLink = `${process.env.BASE_URL_CUSTOMER}/account-activation/${user.verification_code}`;
    const emailBody = accountActivationTemplate.email_body
      .replace(/\[CUSTOMER_NAME\]/g, `${user.first_name} ${user.last_name}`)
      .replace(/\[PROJECT_VIEW_LINK\]/g, activationLink)
      .replace(/\[CUSTOMER_EMAIL\]/g, user.email_address)
      .replace(/\[CUSTOMER_PHONE\]/g, user.phone_no)
      .replace(/\[CONTRACTOR_NAME\]/g, contractorName)
      .replace(/\[CUSTOMER_PASSWORD\]/g, password);
    try {
      await sendEmail({
        to: user.email_address,
        subject: accountActivationTemplate.subject,
        message: "",
        body: emailBody
      });
      await sendSms(
        user.phone_no,
        `Click To Activate Your Account: ${activationLink}`
      );
      return true;
    } catch (error) {
      console.error("Error Sending Activation Email and SMS : ", error);
    }
  }
  static async newCustomerRelation(email_address, contractor_id) {
    const user = await UserServices.getUser({ email_address });
    const contractor = await UserServices.getContractorById(contractor_id);
    const accountActivationTemplate = await this.getTemplateByName(
      "NEW_CONTRACTOR"
    );
    if (!accountActivationTemplate) {
      throw new Error("Email template not found");
    }

    const emailBody = accountActivationTemplate.email_body
      .replace(/\[CUSTOMER_NAME\]/g, `${user.first_name} ${user.last_name}`)
      .replace(
        /\[CONTRACTOR_NAME\]/g,
        `${contractor.first_name} ${contractor.last_name}`
      );
    try {
      await sendEmail({
        to: user.email_address,
        subject: accountActivationTemplate.subject,
        message: "",
        body: emailBody
      });
      return true;
    } catch (error) {
      console.error("Error Sending Activation Email and SMS :", error);
    }
  }
  static async sendContractorActivationEmail(email_address) {
    const user = await UserServices.getUser({ email_address });
    const accountActivationTemplate = await this.getTemplateByName(
      "ACCOUNT_ACTIVATION"
    );
    if (!accountActivationTemplate) {
      throw new Error("Email template not found");
    }
    if (!user.verification_code || user.verification_code === null) {
      user.verification_code = uuidv4().toString();
      await user.save();
    }
    const activationLink = `${process.env.BASE_URL_CONTRACTOR}/account-activation/${user.verification_code}`;
    const emailBody = accountActivationTemplate.email_body
      .replace(/\[NAME\]/g, `${user.first_name} ${user.last_name}`)
      .replace(/\[ACCOUNT_ACTIVATION_LINK\]/g, activationLink);
    try {
      await sendEmail({
        to: user.email_address,
        subject: accountActivationTemplate.subject,
        message: "",
        body: emailBody
      });
      await sendSms(
        user.phone_no,
        `Click To Activate Your Account: ${activationLink}`
      );
      return true;
    } catch (error) {
      console.error("Error Sending Activation Email and SMS :", error);
    }
  }

  static async sendCustomerPasswordResetEmail(email_address) {
    const user = await UserServices.getUser({ email_address });
    const newVerificationCode = uuidv4().toString();
    const updateVerificationCode = await db.Users.update(
      { verification_code: newVerificationCode },
      { where: { email_address } }
    );
    if (!updateVerificationCode) {
      throw new Error("Failed to update verification code");
    }
    const forgotPasswordTemplate = await this.getTemplateByName(
      "FORGET_PASSWORD"
    );
    if (!forgotPasswordTemplate) {
      throw new Error("Email template not found");
    }
    const resetLink = `${process.env.BASE_URL_CUSTOMER}/reset-password/${newVerificationCode}`;
    const emailBody = forgotPasswordTemplate.email_body
      .replace(/\[NAME\]/g, `${user.first_name} ${user.last_name}`)
      .replace(/\[PASSWORD_RESET_LINK\]/g, resetLink);
    try {
      await sendEmail({
        to: user.email_address,
        subject: forgotPasswordTemplate.subject,
        message: "",
        body: emailBody
      });
      await sendSms(
        user.phone_no,
        `Click To Reset Your Password: ${resetLink}`
      );
      return true;
    } catch (error) {
      console.error("Error Sending Password Reset Email and SMS :", error);
    }
  }
  static async sendContractorPasswordResetEmail(email_address) {
    const user = await UserServices.getUser({ email_address });
    const newVerificationCode = uuidv4().toString();
    const updateVerificationCode = await db.Users.update(
      { verification_code: newVerificationCode },
      { where: { email_address } }
    );
    if (!updateVerificationCode) {
      throw new Error("Failed to update verification code");
    }
    const forgotPasswordTemplate = await this.getTemplateByName(
      "FORGET_PASSWORD"
    );
    if (!forgotPasswordTemplate) {
      throw new Error("Email template not found");
    }
    const resetLink = `${process.env.BASE_URL_CONTRACTOR}/reset-password/${newVerificationCode}`;
    const emailBody = forgotPasswordTemplate.email_body
      .replace(/\[NAME\]/g, `${user.first_name} ${user.last_name}`)
      .replace(/\[PASSWORD_RESET_LINK\]/g, resetLink);
    try {
      await sendEmail({
        to: user.email_address,
        subject: forgotPasswordTemplate.subject,
        message: "",
        body: emailBody
      });
      await sendSms(
        user.phone_no,
        `Click To Reset Your Password: ${resetLink}`
      );
      return true;
    } catch (error) {
      console.error("Error Sending Password Reset Email and SMS :", error);
    }
  }

  static async sendEstimationCreatedEmail(
    email_address,
    project,
    customer,
    estimationUrl
  ) {
    const estimationCreatedTemplate = await this.getTemplateByName(
      "ESTIMATION_CREATED"
    );
    if (!estimationCreatedTemplate) {
      throw new Error("Email template not found");
    }
    const emailBody = estimationCreatedTemplate.email_body
      .replace(/\[NAME\]/g, customer.first_name + " " + customer.last_name)
      .replace(/\[PROJECT_NAME\]/g, project.title)
      .replace(/\[ESTIMATION_URL\]/g, estimationUrl);
    try {
      await sendEmail({
        to: email_address,
        subject: estimationCreatedTemplate.subject,
        message: "",
        body: emailBody
      });
      return true;
    } catch (error) {
      console.error("Error Sending Estimation Created Email:", error);
    }
  }

  static async sendEstimationCreatedSms(phone_no, message) {
    try {
      await sendSms(phone_no, message);
      return true;
    } catch (error) {
      console.error("Error Sending Estimation Created SMS:", error);
    }
  }

  static async sendAdminPasswordResetEmail(email_address) {
    const user = await AdminUserServices.getAdminUser({ email_address });
    const newVerificationCode = uuidv4().toString();
    const updateVerificationCode = await db.AdminUsers.update(
      { verification_code: newVerificationCode },
      { where: { email_address } }
    );
    if (!updateVerificationCode) {
      throw new Error("Failed to update verification code");
    }
    const forgotPasswordTemplate = await this.getTemplateByName(
      "FORGET_PASSWORD"
    );

    if (!estimationCreatedTemplate) {
      throw new Error("Email template not found");
    }
    const resetLink = `${process.env.BASE_URL_ADMIN}/reset-password/${newVerificationCode}`;
    const emailBody = forgotPasswordTemplate.email_body
      .replace(/\[NAME\]/g, `${user.first_name} ${user.last_name}`)
      .replace(/\[PASSWORD_RESET_LINK\]/g, resetLink);
    try {
      await sendEmail({
        to: email_address,
        subject: estimationCreatedTemplate.subject,
        message: "",
        body: emailBody
      });
      await sendSms(
        user.phone_no,
        `Click To Reset Your Password: ${resetLink}`
      );
      return true;
    } catch (error) {
      console.error("Error Admin Password Reset Email:", error);
    }
  }

  static async getInviteTemplates(name, uuid, image_url) {
    try {
      const emailTemplate = await this.getTemplateByName("INVITATION_EMAIL");
      if (!emailTemplate) {
        throw new Error("Email template not found");
      }
      const imageUrl = (process.env.S3_BASE_PATH + image_url).toString();
      const invitationLink =
        process.env.BASE_URL_CUSTOMER + "/register/" + uuid;
      const invitationLink2 =
        process.env.BASE_URL_CONTRACTOR + "/register/" + uuid;
      const emailBody = emailTemplate.email_body
        .replace(/\[IMAGE_URL\]/g, imageUrl)
        .replace(/\[CONTRACTOR_NAME\]/g, name)
        .replace(/\[INVITATION_LINK\]/g, invitationLink);
      const email = emailBody;
      const emailBody2 = emailTemplate.email_body
        .replace(/\[IMAGE_URL\]/g, imageUrl)
        .replace(/\[CONTRACTOR_NAME\]/g, name)
        .replace(/\[INVITATION_LINK\]/g, invitationLink2);
      const email2 = emailBody2;
      const sms = `Click To Register : ${invitationLink}`;
      const sms2 = `Click To Register : ${invitationLink2}`;
      return {
        customer: {
          email: email,
          sms: sms
        },
        contractor: {
          email: email2,
          sms: sms2
        }
      };
    } catch (error) {
      console.error("Error Getting Invite Email Template : ", error);
    }
  }

  static async sendInvitationEmail(
    mail_address,
    email_for,
    message,
    name,
    uuid,
    image_url
  ) {
    const emailTemplate = await this.getTemplateByName("INVITATION_EMAIL");
    if (!emailTemplate) {
      throw new Error("Email template not found");
    }
    // const imageUrl = (process.env.S3_BASE_PATH + image_url).toString();
    // const invitationLink = `${
    //   email_for === "customer"
    //     ? process.env.BASE_URL_CUSTOMER
    //     : process.env.BASE_URL_CONTRACTOR
    // }/register/${uuid}`;
    // const imageTag = `<img
    // src="${imageUrl}"
    // alt="contractor-logo"
    // class="main-logo"
    // width="200"
    // height="auto"
    // />`;
    // const emailBody = emailTemplate.email_body
    //   .replace(/\[IMAGE_URL\]/g, imageUrl)
    //   .replace(/\[CONTRACTOR_NAME\]/g, name)
    //   .replace(/\[INVITATION_LINK\]/g, invitationLink);
    // Combine the original message with the image tag
    // const fullMessage = `${imageTag}${message}`;
    try {
      await sendEmail({
        to: mail_address,
        subject: emailTemplate.subject,
        body: message
      });
      return true;
    } catch (error) {
      console.error("Error Sending Bulk Invitation Email:", error);
      return false;
    }
  }

  static async sendInvitationSms(phone_no, sms_for, message, uuid) {
    try {
      // const invitationLink = `${
      //   sms_for === "customer"
      //     ? process.env.BASE_URL_CUSTOMER
      //     : process.env.BASE_URL_CONTRACTOR
      // }/register/${uuid}`;
      // const message = `Click To Register: ${invitationLink}`;
      const smsStatus = await sendSms(phone_no, message);
      if (!smsStatus) {
        throw new Error("Error Sending Invitation SMS");
      }
      return true;
    } catch (error) {
      console.error("Error Sending Invitation SMS:", error);
    }
  }
}

module.exports = EmailServices;
