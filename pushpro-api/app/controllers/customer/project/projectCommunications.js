const db = require("../../../../models");
const { ValidationError, ServerError } = require("../../../errors/CustomError");
const NotificationService = require("../../../services/notification");
const catchAsyncError = require("../../../helpers/catch-async-error");
const { uploadToS3 } = require("../../../helpers/s3Helper");

// GET all project communications
const getProjectCommunications = catchAsyncError(async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const projectCommunications = await db.ProjectCommunications.findAll({
      where: {
        project_id: projectId,
        [db.Sequelize.Op.or]: [
          { "$project.customer_id$": userId },
          { "$project.contractor_id$": userId }
        ]
      },
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
          ]
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
    if (!projectCommunications || projectCommunications.length === 0) {
      const project = await db.Projects.findOne({
        where: { id: projectId },
        attributes: [
          "id",
          "project_uuid",
          "title",
          "description",
          "status_id",
          "customer_id",
          "contractor_id"
        ]
      });

      if (project) {
        // Fetch receiver and sender details based on userId
        const receiver = await db.Users.findOne({
          where: { id: project.customer_id },
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email_address",
            "status",
            "profile_url"
          ]
        });

        const sender = await db.Users.findOne({
          where: { id: project.contractor_id },
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email_address",
            "status",
            "profile_url"
          ]
        });

        res.status(200).json({
          success: true,
          data: [
            {
              project,
              receiver,
              sender,
              id: null,
              project_id: project.id,
              sender_id: sender.id,
              receiver_id: receiver.id,
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
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Project Communications: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

// Get All Project and last chat data only
const getChatAndProjectTitle = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const { contractorId } = req.body;
    if (!contractorId) {
      throw new ValidationError("Contractor ID is required");
    }
    const contractor = await db.Users.findOne({
      where: { user_uuid: contractorId, is_contractor: true }
    });
    if (!contractor) {
      throw new ValidationError("Contractor not found");
    }
    const projects = await db.Projects.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { customer_id: userId },
          { contractor_id: userId }
        ]
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

    const filteredChat = projectCommunications.filter(
      (data) =>
        data.project.customer_id === userId &&
        data.project.contractor_id === contractor.id
    );

    res.status(200).json({
      success: true,
      data: filteredChat,
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
      where: { id: project_id, customer_id: sender_id }
    });
    const receiverChat = await db.Projects.findOne({
      where: { id: project_id, contractor_id: receiver_id }
    });
    if (userId !== senderChat.customer_id) {
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
      link: `${process.env.BASE_URL_CONTRACTOR}/project-communication/${project_id}/`,
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
