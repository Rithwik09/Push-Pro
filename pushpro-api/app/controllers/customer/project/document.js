const DocumentServices = require("../../../services/customer/document");
const ProjectServices = require("../../../services/project");
const UserServices = require("../../../services/user");
const catchAsyncError = require("../../../helpers/catch-async-error");
const {
  ServerError,
  ValidationError,
  NotFoundError
} = require("../../../errors/CustomError");
const { uploadToS3, deleteFromS3 } = require("../../../helpers/s3Helper");

const isValidUserId = async (user_id) => {
  const user = await UserServices.getCustomer({ id: user_id });
  if (!user) throw new NotFoundError("Invalid Token. Please Login Again");
};

const checkProjectStatus = async (status_id) => {
  if (status_id > 4) {
    throw new ValidationError("Estimation Created Cannot Modify");
  }
};

const getProjectDocuments = catchAsyncError(async (req, res) => {
  try {
    const user_id = req.user.id;
    await isValidUserId(user_id);
    const projectId = req.params.id;
    await ProjectServices.getProjectById(projectId);
    const documents = await DocumentServices.getDocuments(projectId);
    res.status(200).json({
      success: true,
      data: documents,
      message: "Documents fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Documents: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getProjectDocumentById = catchAsyncError(async (req, res) => {
  try {
    const user_id = req.user.id;
    await isValidUserId(user_id);
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
      throw new ValidationError("Document Id must be a valid integer");
    const document = await DocumentServices.getDocumentById(id);
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Document: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const createProjectDocument = catchAsyncError(async (req, res) => {
  try {
    const user_id = req.user.id;
    await isValidUserId(user_id);
    const project_id = req.params.id;
    if (!project_id) throw new ValidationError("Project Id Required");
    const project = await ProjectServices.getProjectById(project_id);
    checkProjectStatus(project.status_id);
    const { title } = req.body;
    const files = req.files;
    if (!files || !files.file_url) {
      throw new ValidationError("Image Required");
    }
    let uploadPromises = [];
    let fileKey = null;
    if (files.file_url) {
      const file = files.file_url[0];
      fileKey = `documents/${project_id}/${Date.now()}_${file.originalname}`;
      const existingKey = null;
      uploadPromises.push(uploadToS3(fileKey, file, existingKey));
    }
    await Promise.all(uploadPromises);
    const payload = {
      project_id: project_id,
      title: title,
      file_url: fileKey
    };
    const document = await DocumentServices.createDocument(payload);
    res.status(200).json({
      success: true,
      data: document,
      message: "Document created successfully",
      errors: []
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(error.status).json(error.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Create Document: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateProjectDocument = catchAsyncError(async (req, res) => {
  try {
    const user_id = req.user.id;
    await isValidUserId(user_id);
    const id = req.params.id;
    const files = req.files;
    let document = await DocumentServices.getDocumentById(id);
    const project = await ProjectServices.getProjectById(document.project_id);
    checkProjectStatus(project.status_id);
    const { title } = req.body;
    if (!title) throw new ValidationError("Title Required");
    let uploadPromises = [];
    let fileKey = null;
    if (files.file_url) {
      const file = files.file_url[0];
      fileKey = `documents/${Date.now()}_${file.originalname}`;
      const existingKey = document ? document.file_url : null;
      uploadPromises.push(uploadToS3(fileKey, file, existingKey));
    }
    await Promise.all(uploadPromises);
    const payload = {
      title: title,
      file_url: fileKey ? fileKey : document.file_url
    };
    document = await DocumentServices.updateDocument(id, payload);
    document = await DocumentServices.getDocumentById(id);
    res.status(200).json({
      success: true,
      data: document,
      message: "Document updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Document: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const deleteProjectDocument = catchAsyncError(async (req, res) => {
  try {
    const user_id = req.user.id;
    await isValidUserId(user_id);
    const id = req.params.id;
    if (!id) throw new ValidationError("Document Id Required");
    let document = await DocumentServices.getDocumentById(id);
    if (document.file_url) {
      await deleteFromS3(document.file_url);
    }
    document = await DocumentServices.deleteDocument(id);
    res.status(200).json({
      success: true,
      data: document,
      message: "Document deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Delete Document: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getProjectDocuments,
  getProjectDocumentById,
  createProjectDocument,
  updateProjectDocument,
  deleteProjectDocument
};
