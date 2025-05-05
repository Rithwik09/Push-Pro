const db = require("../../models");
const APIFeature = require("../../utils/APIFeature");
const { NotFoundError, ValidationError } = require("../errors/CustomError");
const { sendEmail } = require("../helpers/sendMail");

class ProjectScheduleServices {
  static async getSchedules({ pageNo, limit, search, condition }) {
    const schedules = new APIFeature({
      query: db.ProjectSchedules,
      limit
    });
    if (search) {
      schedules.search({
        title: search,
        description: search
      });
    }
    if (condition) {
      schedules.whereAnd(condition);
    }
    schedules.projection([
      "id",
      "project_id",
      "customer_id",
      "contractor_id",
      "created_by",
      "title",
      "description",
      "start_time",
      "end_time",
      "status"
    ]);
    schedules.orderBy([["createdAt", "DESC"]]);
    schedules.paginate(pageNo || 1);
    const result = await schedules.exec();
    return {
      schedules: result?.rows || [],
      totalPage: schedules.getTotalPages() || 0
    };
  }

  static async getAllSchedules(query) {
    const schedules = await db.ProjectSchedules.findAll(
      { where: query },
      { order: [["id", "DESC"]] }
    );
    return schedules || [];
  }

  static async getSchedule(query) {
    const schedule = await db.ProjectSchedules.findOne({
      where: query
    });
    if (!schedule || schedule.length === 0)
      throw new NotFoundError("Project Schedule Not Found");
    return schedule.dataValues;
  }

  static async getCustomerSchedules(
    userId,
    { pageNo, limit, search, condition, services }
  ) {
    const user = await db.Users.findOne({
      where: { id: userId, is_customer: true }
    });
    if (!user) throw new NotFoundError("Customer Not Found");
    const projects = await this.getProjects({
      pageNo,
      limit,
      search,
      condition: { ...condition, customer_id: userId },
      services
    });
    if (!projects || projects.length === 0)
      throw new NotFoundError("Projects Not Found");
    return projects;
  }

  static async getContractorSchedules(
    userId,
    { pageNo, limit, search, condition, services }
  ) {
    const user = await db.Users.findOne({
      where: { id: userId, is_contractor: true }
    });
    if (!user) throw new NotFoundError("Contractor Not Found");
    const projects = await this.getProjects({
      pageNo,
      limit,
      search,
      condition: { ...condition, contractor_id: userId },
      services
    });
    if (!projects || projects.length === 0)
      throw new NotFoundError("Projects Not Found");
    return projects;
  }

  static async createProjectSchedule(payload) {
    const relation = await db.CustomersContractors.findOne({
      where: {
        customer_id: payload.customer_id,
        contractor_id: payload.contractor_id
      }
    });
    if (!relation)
      throw new ValidationError("Contractor Customer Relation Error");
    const project = await db.ProjectSchedules.create({
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    if (!project)
      throw new ValidationError("Project Schuedule Creation Failed");
    project.save();
    return project;
  }

  static async updateProjectSchedule(payload, condition) {
    const updatedPayload = {
      ...payload,
      updatedAt: new Date()
    };
    const [updatedRowsCount] = await db.ProjectSchedules.update(
      updatedPayload,
      {
        where: condition
      }
    );
    if (updatedRowsCount === 0)
      throw new ValidationError("Project Schedule Update Failed");
    const schedule = await this.getSchedule(condition);
    return schedule;
  }

  static async deleteProjectSchedule(query) {
    const schedule = await db.ProjectSchedules.destroy({
      where: query
    });
    if (!schedule)
      throw new NotFoundError("Project Schedule Not Found or Already Deleted");
    return schedule;
  }

  static async getEmailTemplateByName(templateName) {
    return await db.EmailTemplates.findOne({ where: { name: templateName } });
  }

  static async sendProjectScheduleNotificationEmail(
    customerEmail,
    contractorEmail,
    templateName,
    replacements
  ) {
    const projectNotificationTemplate = await this.getEmailTemplateByName(
      templateName
    );
    if (!projectNotificationTemplate) {
      throw new Error("Email Template Not Found");
    }

    let emailBody = projectNotificationTemplate.email_body;
    for (const [key, value] of Object.entries(replacements)) {
      emailBody = emailBody.replace(`[${key.toUpperCase()}]`, value);
    }
    try {
      // await sendEmail({
      //   to: customerEmail,
      //   subject: projectNotificationTemplate.subject,
      //   message: "",
      //   body: emailBody
      // });
      await sendEmail({
        to: contractorEmail,
        subject: projectNotificationTemplate.subject,
        message: "",
        body: emailBody
      });
      return true;
    } catch (error) {
      throw new Error(
        "Project Services Class Error: Sending Notification Email"
      );
    }
  }
}

module.exports = ProjectScheduleServices;
