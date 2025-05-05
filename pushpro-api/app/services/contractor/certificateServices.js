const db = require("../../../models");
const { NotFoundError } = require("../../errors/CustomError");

class ContractorCertificateServices {
  static async getCertificate(certificateId, userId) {
    const certificate = await db.ContractorCertificates.findOne({
      where: {
        id: certificateId,
        user_id: userId
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
    if (!certificate) {
      throw new NotFoundError("Certificate Not Found");
    }
    return certificate;
  }

  static async getUserCertificates(userId) {
    return await db.ContractorCertificates.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
  }

  static async createCertificate(certificateData) {
    const createCertificate = await db.ContractorCertificates.create(
      certificateData
    );
    await createCertificate.save();
    return createCertificate;
  }

  static async updateCertificate(certificateId, certificateData) {
    const [updateRowCount] = await db.ContractorCertificates.update(
      certificateData,
      {
        where: { id: certificateId }
      }
    );
    if (updateRowCount === 0) {
      throw new NotFoundError("Certificate Not Found");
    }
    return updateRowCount;
  }

  static async deleteCertificate(certificateId) {
    const deleteRowCount = await db.ContractorCertificates.destroy({
      where: {
        id: certificateId
      }
    });
    if (deleteRowCount === 0) {
      throw new NotFoundError("Certificate Not Found");
    }
    return deleteRowCount;
  }
}

module.exports = ContractorCertificateServices;
