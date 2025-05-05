const db = require("../../../models");
const { NotFoundError, ValidationError } = require("../../errors/CustomError");

class DocumentServices {
  static async getDocuments(projectId) {
    const documents = await db.ProjectDocuments.findAll({
      where: { project_id: projectId },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "project_id", "title", "file_url"]
    });
    if (!documents || documents.length === 0) return [];
    return documents;
  }
  static async getDocumentById(documentId) {
    const document = await db.ProjectDocuments.findOne({
      where: { id: documentId }
    });
    if (!document) throw new NotFoundError("Document Not Found");
    return document;
  }

  static async createDocument(payload) {
    const document = await db.ProjectDocuments.create(payload);
    if (!document) throw new NotFoundError("Document Creation Failed");
    document.save();
    return document;
  }

  static async updateDocument(documentId, payload) {
    const updatedPayload = {
      ...payload,
      updatedAt: new Date()
    };
    const [documentRowCount] = await db.ProjectDocuments.update(
      updatedPayload,
      {
        where: { id: documentId }
      }
    );
    if (!documentRowCount || documentRowCount === 0)
      throw new NotFoundError("Document Update Failed");
    return documentRowCount;
  }

  static async deleteDocument(documentId) {
    const document = await db.ProjectDocuments.destroy({
      where: { id: documentId }
    });
    if (document === 0) throw new NotFoundError("Document Deletion Failed");
    return document;
  }
}

module.exports = DocumentServices;
