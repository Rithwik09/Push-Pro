const db = require("../../../../models");
const { ValidationError, ServerError } = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const ProjectServices = require("../../../../app/services/project");

// get notification for popup Limit : 5
const getQuickNotification = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await db.Notifications.findAll({
      where: { user_id: userId, is_read: false },
      order: [["id", "DESC"]],
      include: [
        {
          model: db.NotificationType,
          as: "type"
        },
        {
          model: db.Projects,
          as: "project",
          attributes: [
            "id",
            "title",
            "status_id",
            "customer_id",
            "contractor_id"
          ],
          include: [
            {
              model: db.Users,
              as: "customer",
              attributes: [
                "id",
                "first_name",
                "last_name",
                "is_contractor",
                "is_customer",
                "status",
                "profile_url"
              ]
            },
            {
              model: db.Users,
              as: "contractor",
              attributes: [
                "id",
                "first_name",
                "last_name",
                "is_contractor",
                "is_customer",
                "status",
                "profile_url"
              ]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: notifications,
      message: "Quick notifications fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Quick Notifications: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getNotificationList = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const { pageNo = 1, limit = 10, search = "", type_id } = req.body;

    const offset = (pageNo - 1) * limit;

    let whereClause = { user_id: userId };
    if (type_id) {
      if (Array.isArray(type_id) && type_id.length > 0) {
        whereClause.type_id = { [db.Sequelize.Op.in]: type_id };
      } else if (typeof type_id === "number") {
        whereClause.type_id = type_id;
      }
    }

    let includeClause = [
      {
        model: db.NotificationType,
        as: "type"
      },
      {
        model: db.Projects,
        as: "project",
        attributes: [
          "id",
          "title",
          "status_id",
          "customer_id",
          "contractor_id"
        ],
        include: [
          {
            model: db.Users,
            as: "customer",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "is_contractor",
              "is_customer",
              "status",
              "profile_url"
            ]
          },
          {
            model: db.Users,
            as: "contractor",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "is_contractor",
              "is_customer",
              "status",
              "profile_url"
            ]
          }
        ]
      }
    ];

    if (search) {
      whereClause = {
        ...whereClause,
        [db.Sequelize.Op.or]: [
          { text: { [db.Sequelize.Op.like]: `%${search}%` } },
          { "$project.title$": { [db.Sequelize.Op.like]: `%${search}%` } },
          {
            "$project.customer.first_name$": {
              [db.Sequelize.Op.like]: `%${search}%`
            }
          },
          {
            "$project.customer.last_name$": {
              [db.Sequelize.Op.like]: `%${search}%`
            }
          },
          {
            "$project.contractor.first_name$": {
              [db.Sequelize.Op.like]: `%${search}%`
            }
          },
          {
            "$project.contractor.last_name$": {
              [db.Sequelize.Op.like]: `%${search}%`
            }
          }
        ]
      };
    }

    const orderClause = [["createdAt", "DESC"]];
    const notifications = await db.Notifications.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      include: includeClause,
      order: orderClause
    });

    res.status(200).json({
      success: true,
      data: notifications.rows,
      total: notifications.count,
      currentPage: parseInt(pageNo),
      totalPages: Math.ceil(notifications.count / limit),
      message: "Notification list fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Notification List: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateNotificationById = catchAsyncError(async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    const userId = req.user.id;
    const projectId = req.body.project_id;
    const notification = await db.Notifications.findOne({
      where: { id, project_id: projectId }
    });
    if (!notification) {
      throw new ValidationError(
        "Notification not found or you don't have permission to update it"
      );
    }
    await notification.update({ is_read });
    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification updated successfully",
      errors: []
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        data: null,
        message: error.message,
        errors: error.errors
      });
    } else {
      const serverError = new ServerError(
        `Cannot Update Notification: ${error.message}`
      );
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const createNotification = catchAsyncError(async (req, res) => {
  try {
    const { user_id, type_id, text, link, project_id } = req.body;
    const userId = req.user.id;
    if (!user_id || !type_id || !text) {
      throw new ValidationError("All required fields are missing");
    }
    if (user_id === userId) {
      throw new ValidationError("Cannot create a notification for yourself");
    }
    const project = await ProjectServices.getProjectById(project_id);
    if (!project) {
      throw new ValidationError("Invalid project ID");
    }
    const isCustomer = project.customer_id === user_id;

    if (!isCustomer) {
      throw new ValidationError(
        "You are not authorized to create a notification for this project"
      );
    }
    const newNotification = await db.Notifications.create({
      user_id,
      project_id,
      type_id,
      text,
      link
    });
    res.status(201).json({
      success: true,
      data: newNotification,
      message: "Notification created successfully",
      errors: []
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        data: null,
        message: error.message,
        errors: error.errors
      });
    } else {
      const serverError = new ServerError(
        `Cannot Create Notification: ${error.message}`
      );
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

module.exports = {
  getQuickNotification,
  getNotificationList,
  updateNotificationById,
  createNotification
};
