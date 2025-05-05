const db = require("../../models");
const { v4: uuidv4 } = require("uuid");
const APIFeature = require("../../utils/APIFeature");
const { NotFoundError, ValidationError } = require("../errors/CustomError");
const validator = require("validator");
const { sendEmail, sendSms } = require("../helpers/sendMail");
const { Op } = require("sequelize");

class ProjectServices {
  static async getProjects({
    pageNo = 1,
    limit = 5,
    search,
    condition,
    services
  }) {
    const offset = (pageNo - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { project_uuid: { [Op.iLike]: `%${search}%` } },
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    if (condition) {
      whereClause = { ...whereClause, ...condition };
    }

    if (services && services.length > 0) {
      const projectServices = await db.ProjectServices.findAll({
        attributes: ["project_id"],
        where: { service_id: services },
        raw: true
      });
      const projectIds = projectServices.map((ps) => ps.project_id);
      whereClause.id = projectIds;
    }

    const { count, rows } = await db.Projects.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "customer_id",
        "contractor_id",
        "title",
        "description",
        "address_line_1",
        "address_line_2",
        "city",
        "state",
        "zip_code",
        "date_preference",
        "start_date",
        "end_date",
        "budget_preference",
        "budget_min",
        "budget_max",
        "project_type",
        "project_category",
        "status_id",
        "createdAt"
      ],
      order: [["id", "DESC"]],
      limit,
      offset
    });

    const totalItems = count;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      projects: rows,
      totalPages,
      totalItems
    };
  }

  static async getCustomerProjects(
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
    return projects;
  }

  static async getContractorProjects({
    userId,
    pageNo = 1,
    limit = 5,
    search = "",
    services = [],
    name = "",
    condition = {}
  }) {
    try {
      if (!userId) {
        throw new Error("userId is required");
      }

      const offset = (pageNo - 1) * limit;

      // Get customer IDs from CustomerContractors relation
      const customerContractors = await db.CustomersContractors.findAll({
        where: { contractor_id: userId }
      });

      if (!customerContractors.length) {
        return {
          projects: [],
          totalPages: 0,
          totalItems: 0
        };
      }

      const customerIds = customerContractors.map((cc) => cc.customer_id);

      // Filter customers by name if provided
      let filteredCustomerIds = customerIds;
      if (name) {
        const customers = await db.Users.findAll({
          where: {
            id: customerIds,
            [Op.or]: [
              { first_name: { [Op.iLike]: `%${name}%` } },
              { last_name: { [Op.iLike]: `%${name}%` } }
            ]
          },
          attributes: ["id"],
          raw: true
        });
        filteredCustomerIds = customers.map((c) => c.id);

        if (!filteredCustomerIds.length) {
          return {
            projects: [],
            totalPages: 0,
            totalItems: 0
          };
        }
      }

      // Build base where clause
      let whereClause = {
        customer_id: filteredCustomerIds,
        contractor_id: userId
      };

      // Add title condition if provided
      if (condition.title) {
        whereClause.title = { [Op.iLike]: `%${condition.title}%` };
      }

      // Add status condition if provided
      if (condition.status_id !== undefined && condition.status_id !== null) {
        whereClause.status_id = condition.status_id;
      }

      // Add search condition if provided
      if (search) {
        whereClause = {
          ...whereClause,
          [Op.and]: [
            whereClause,
            {
              [Op.or]: [
                { project_uuid: { [Op.iLike]: `%${search}%` } },
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
              ]
            }
          ]
        };
      }

      // Filter by services if provided
      if (services && services.length > 0) {
        const projectServices = await db.ProjectServices.findAll({
          attributes: ["project_id"],
          where: { service_id: services },
          raw: true
        });

        if (!projectServices.length) {
          return {
            projects: [],
            totalPages: 0,
            totalItems: 0
          };
        }

        const projectIds = projectServices.map((ps) => ps.project_id);
        whereClause = {
          ...whereClause,
          id: { [Op.in]: projectIds }
        };
      }

      // Get projects with pagination
      const { count, rows } = await db.Projects.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.Users,
            as: "customer",
            attributes: ["first_name", "last_name"],
            required: true
          }
        ],
        attributes: [
          "id",
          "customer_id",
          "contractor_id",
          "title",
          "description",
          "address_line_1",
          "address_line_2",
          "city",
          "state",
          "zip_code",
          "date_preference",
          "start_date",
          "end_date",
          "budget_preference",
          "budget_min",
          "budget_max",
          "project_type",
          "project_category",
          "status_id",
          "createdAt"
        ],
        order: [["id", "DESC"]],
        limit,
        offset,
        distinct: true
      });

      const totalItems = count;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        projects: rows,
        totalPages,
        totalItems
      };
    } catch (error) {
      console.error("Error in getContractorProjects service function:", error);
      throw error;
    }
  }

  static async getProjectById(projectId) {
    if (!projectId) throw new ValidationError("Invalid Project ID");
    const project = await db.Projects.findOne({
      where: { id: projectId },
      attributes: [
        "id",
        "project_uuid",
        "customer_id",
        "contractor_id",
        "title",
        "description",
        "address_line_1",
        "address_line_2",
        "city",
        "state",
        "zip_code",
        "date_preference",
        "start_date",
        "end_date",
        "budget_preference",
        "budget_min",
        "budget_max",
        "project_type",
        "project_category",
        "status_id",
        "createdAt"
      ]
    });
    if (!project || project.length === 0)
      throw new NotFoundError("Project Not Found");
    return project.dataValues;
  }

  static async getProjectIdByUuid(uuid) {
    if (!uuid) throw new ValidationError("Invalid Project ID");
    const project = await db.Projects.findOne({
      where: { project_uuid: uuid },
      attributes: [
        "id",
        "title",
        "created_by",
        "customer_id",
        "contractor_id",
        "address_line_1",
        "address_line_2",
        "city",
        "state",
        "zip_code"
      ]
    });
    if (!project || project.length === 0)
      throw new NotFoundError("Project Not Found");
    return project.dataValues;
  }

  static async getProjectsByTime({ userId, startDate, endDate }) {
    if (!userId) throw new ValidationError("Invalid User ID");
    if (!startDate || !endDate) throw new ValidationError("Invalid Date Range");

    const projects = await db.Projects.findAll({
      where: {
        contractor_id: userId,
        createdAt: {
          [Op.between]: [startDate, endDate] // Fetch projects created within the date range
        }
      },
      order: [["createdAt", "ASC"]] // Order by creation date ascending
    });
    if (!projects || projects.length === 0) {
      return [];
    }
    return projects.map((project) => project.dataValues);
  }
  static async getAreas() {
    const areas = await db.Areas.findAll();
    if (!areas || areas.length === 0)
      throw new NotFoundError("Areas Not Found");
    return areas;
  }

  static async getProjectStatuses() {
    const projectStatuses = await db.ProjectStatuses.findAll();
    if (!projectStatuses || projectStatuses.length === 0)
      throw new NotFoundError("Project Statuses Not Found");
    return projectStatuses;
  }

  static async getProjectAreas(projectId) {
    if (!projectId || !validator.isNumeric(projectId.toString())) {
      throw new ValidationError("Invalid Project ID");
    }
    const projectAreas = await db.ProjectAreas.findAll({
      where: { project_id: projectId }
    });
    if (!projectAreas || projectAreas.length === 0) {
      return [];
    }
    return projectAreas;
  }

  static async setProjectAreas(projectId, areas) {
    const project = await this.getProjectById(projectId);
    let projectAreas = [];
    projectAreas = await db.ProjectAreas.destroy({
      where: { project_id: project.id }
    });
    for (let i = 0; i < areas.length; i++) {
      projectAreas = await db.ProjectAreas.create(
        { project_id: project.id, area_id: areas[i] },
        { ignoreDuplicates: true }
      );
    }
    if (!projectAreas || projectAreas.length === 0)
      throw new NotFoundError("Project Areas Creation Failed");
    return projectAreas;
  }

  static async getProject(query) {
    return await db.Projects.findOne({ where: query });
  }

  static async createProject(payload) {
    const s = await db.CustomersContractors.findOne({
      where: { customer_id: payload.customer_id }
    });
    const relation = await db.Users.findOne({
      where: { user_uuid: payload.user_uuid, is_contractor: true }
    });
    if (!relation)
      throw new ValidationError("Contractor Customer Relation Error");
    const project = await db.Projects.create({
      ...payload,
      project_uuid: uuidv4().toString(),
      contractor_id: relation.id,
      status_id: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    if (!project) throw new ValidationError("Project Creation Failed");
    project.save();
    return project;
  }

  static async updateProject(payload, condition) {
    const updatedPayload = {
      ...payload,
      updatedAt: new Date()
    };
    const [updatedRowsCount] = await db.Projects.update(updatedPayload, {
      where: condition
    });
    if (updatedRowsCount === 0) throw new NotFoundError("Project Not Found");
    return updatedRowsCount;
  }

  static async deleteProject(projectId) {
    const project = await db.Projects.destroy({ where: { id: projectId } });
    if (!project)
      throw new NotFoundError("Project Not Found or Already Deleted");
    return project;
  }

  static async getEmailTemplateByName(templateName) {
    return await db.EmailTemplates.findOne({ where: { name: templateName } });
  }

  static async sendProjectNotificationEmail(
    contractor,
    customer,
    templateName,
    from,
    pid
  ) {
    try {
      const projectNotificationTemplate = await this.getEmailTemplateByName(
        templateName
      );
      if (!projectNotificationTemplate) {
        throw new Error("Email Template Not Found");
      }
      const baseUrl =
        from === "customer"
          ? process.env.BASE_URL_CONTRACTOR
          : process.env.BASE_URL_CUSTOMER;
      const link = `${baseUrl}/project-detail/${pid}`;
      const customer_name = `${customer?.first_name} ${customer?.last_name}`;
      const contractor_name = `${contractor?.first_name} ${contractor?.last_name}`;
      let emailBody = projectNotificationTemplate?.email_body
        .replace(/\[CONTRACTOR_NAME\]/g, contractor_name)
        .replace(/\[CUSTOMER_NAME\]/g, customer_name)
        .replace(/\[PROJECT_VIEW_LINK\]/g, link);
      const recipient =
        from === "customer"
          ? contractor?.email_address
          : customer?.email_address;
      const mailStatus = await sendEmail({
        to: recipient,
        subject: projectNotificationTemplate?.subject,
        message: "",
        body: emailBody
      });
      return !!mailStatus;
    } catch (error) {
      console.error("Error in sendProjectNotificationEmail service function");
      return false;
    }
  }

  static async sendProjectNotificationSms(contractorPhone, contractorMessage) {
    const smsStatus = await sendSms(contractorPhone, contractorMessage);
    // await sendSms(customerPhone, customerMessage);
    if (smsStatus) {
      return true;
    } else {
      return false;
    }
  }

  static async getCustomerProjectStatuses(userId, contId) {
    const projects = await db.Projects.findAll({
      where: { customer_id: userId, contractor_id: contId },
      attributes: ["status_id"],
      raw: true
    });
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status_id] = (acc[project.status_id] || 0) + 1;
      return acc;
    }, {});
    const projectStatuses = Object.entries(statusCounts).map(
      ([status_id, count]) => ({
        status_id: parseInt(status_id, 10),
        count
      })
    );
    return {
      projects: projectStatuses || [],
      total: projects.length || 0
    };
  }

  static async getContractorProjectStatuses(userId) {
    const projects = await db.Projects.findAll({
      where: { contractor_id: userId, status_id: { [Op.gt]: 1 } },
      attributes: ["status_id"],
      raw: true
    });
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status_id] = (acc[project.status_id] || 0) + 1;
      return acc;
    }, {});
    const projectStatuses = Object.entries(statusCounts).map(
      ([status_id, count]) => ({
        status_id: parseInt(status_id, 10),
        count
      })
    );
    return {
      projects: projectStatuses || [],
      total: projects.length || 0
    };
  }
}

module.exports = ProjectServices;
