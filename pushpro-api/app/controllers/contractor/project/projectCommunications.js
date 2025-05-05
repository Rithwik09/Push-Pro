const db = require("../../../../models");
const { ValidationError, ServerError } = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const { uploadToS3 } = require("../../../helpers/s3Helper");
const NotificationService = require("../../../services/notification");

// GET all project communications
const getProjectCommunications = catchAsyncError(async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  const projectCommunications = await db.ProjectCommunications.findAll({
    where: { project_id: projectId },
    include: [
      {
        model: db.Projects,
        as: "project",
        attributes: [
          "id",
          "project_uuid",
          "title",
          "description",
          "status_id",
          "customer_id",
          "contractor_id"
        ],
        where: {
          status_id: { [db.Sequelize.Op.gt]: 1 },
          [db.Sequelize.Op.or]: [
            { customer_id: userId },
            { contractor_id: userId }
          ]
        }
      },
      {
        model: db.Users,
        as: "receiver",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email_address",
          "status",
          "profile_url"
        ]
      },
      {
        model: db.Users,
        as: "sender",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email_address",
          "status",
          "profile_url"
        ]
      }
    ],
    attributes: [
      "id",
      "project_id",
      "sender_id",
      "receiver_id",
      "message",
      "attachment",
      "createdAt"
    ],
    order: [["createdAt", "ASC"]]
  });

  if (projectCommunications.length === 0) {
    const project = await db.Projects.findOne({
      where: { id: projectId, status_id: { [db.Sequelize.Op.gt]: 1 } },
      attributes: [
        "id",
        "project_uuid",
        "title",
        "description",
        "status_id",
        "customer_id",
        "contractor_id"
      ],
      include: [
        {
          model: db.Users,
          as: "customer",
          attributes: ["id", "first_name", "last_name", "email_address", "status", "profile_url"]
        },
        {
          model: db.Users,
          as: "contractor",
          attributes: ["id", "first_name", "last_name", "email_address", "status", "profile_url"]
        }
      ]
    });

    if (project) {
      res.status(200).json({
        success: true,
        data: [
          {
            project,
            receiver: project.customer,
            sender: project.contractor,
            id: null,
            project_id: project.id,
            sender_id: project.contractor.id,
            receiver_id: project.customer.id,
            message: null,
            attachment: null,
            createdAt: null
          }
        ],
        message: "Project details fetched successfully",
        errors: []
      });
    } else {
      res.status(404).json({
        success: false,
        data: null,
        message: "Project not found",
        errors: ["Project not found"]
      });
    }
  } else {
    res.status(200).json({
      success: true,
      data: projectCommunications,
      message: "Project communications fetched successfully",
      errors: []
    });
  }
});

const getChatAndProjectTitle = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await db.Projects.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { customer_id: userId },
          { contractor_id: userId }
        ],
        status_id: { [db.Sequelize.Op.gt]: 1 } // filter status_id > 1
      },
      attributes: [
        "id",
        "project_uuid",
        "title",
        "description",
        "status_id",
        "customer_id",
        "contractor_id"
      ],
      order: [["id", "DESC"]]
    });

    // Find the last communication for each project
    const projectCommunications = await Promise.all(
      projects.map(async (project) => {
        const lastCommunication = await db.ProjectCommunications.findOne({
          where: { project_id: project.id },
          include: [
            {
              model: db.Users,
              as: "receiver",
              attributes: [
                "id",
                "first_name",
                "last_name",
                "email_address",
                "status",
                "profile_url"
              ]
            },
            {
              model: db.Users,
              as: "sender",
              attributes: [
                "id",
                "first_name",
                "last_name",
                "email_address",
                "status",
                "profile_url"
              ]
            }
          ],
          attributes: [
            "id",
            "project_id",
            "sender_id",
            "receiver_id",
            "message",
            "attachment",
            "createdAt",
            "updatedAt"
          ],
          order: [["id", "DESC"]]
        });
        return {
          project,
          lastCommunication
        };
      })
    );

    res.status(200).json({
      success: true,
      data: projectCommunications,
      message: "Project communications fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Project Communications: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

// POST a new project communication
const createProjectCommunication = catchAsyncError(async (req, res) => {
  const { project_id, receiver_id, sender_id, message } = req.body;
  const userId = req.user.id;
  if (!project_id || !receiver_id || !sender_id) {
    throw new ValidationError("All required fields must be provided");
  }
  try {
    const senderChat = await db.Projects.findOne({
      where: { id: project_id, contractor_id: sender_id }
    });
    const receiverChat = await db.Projects.findOne({
      where: { id: project_id, customer_id: receiver_id }
    });
    if (userId !== senderChat.contractor_id) {
      throw new ValidationError(
        "You are not authorized to create a communication for this project"
      );
    }
    if (!senderChat) {
      throw new ValidationError(
        "You are not authorized to create a communication for this project"
      );
    }
    if (!receiverChat) {
      throw new ValidationError(
        "You are not authorized to create a communication for this project"
      );
    }
    let attachment = null;
    if (req.files && req.files.attachment) {
      const fileUploadResult = await uploadToS3(
        `project-communications/${Date.now()}_${
          req.files.attachment[0].originalname
        }`,
        req.files.attachment[0]
      );
      attachment = fileUploadResult.fileKey;
    }
    const newProjectCommunication = await db.ProjectCommunications.create({
      project_id,
      receiver_id,
      sender_id,
      message,
      attachment
    });
    const notification = await NotificationService.createNotification({
      user_id: receiver_id,
      type_id: 11,
      project_id: project_id,
      text: "You have a new Project Message",
      link: `${process.env.BASE_URL_CUSTOMER}/project-communication/${project_id}/`,
      is_read: false
    });
    if (!notification) throw new NotFoundError("Notification Creation Failed.");
    res.status(201).json({
      success: true,
      data: newProjectCommunication,
      message: "Project communication created successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create Project Communication: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getProjectCommunications,
  createProjectCommunication,
  getChatAndProjectTitle
};
