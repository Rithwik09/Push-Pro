const db = require("../../../models");
const { NotFoundError } = require("../../errors/CustomError");

class CompanyDetailsServices {
  static async getCompanyDetails(userId) {
    const details = await db.CompanyDetails.findOne({
      where: { user_id: userId },
      attributes: {
        exclude: ["user_id", "createdAt", "updatedAt"]
      }
    });
    if (!details) return "";
    return details;
  }

  static async createDetails(userId, contractText) {
    const createBranding = await db.CompanyDetails.create({
      user_id: userId,
      contract_text: contractText,
      updatedAt: new Date()
    });
    await createBranding.save();
    return createBranding;
  }

  static async updateDetails(userId, contractText) {
    const [updateRowCount] = await db.CompanyDetails.update(
      {
        contract_text: contractText,
        updatedAt: new Date()
      },
      {
        where: { user_id: userId }
      }
    );
    if (updateRowCount === 0) {
      throw new NotFoundError("Update Function Failed");
    }
    return updateRowCount;
  }
}

module.exports = CompanyDetailsServices;
