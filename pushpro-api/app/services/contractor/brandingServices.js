const db = require("../../../models");
const { NotFoundError } = require("../../errors/CustomError");

class ContractorBrandingServices {
  static async getBranding(userId) {
    return await db.ContractorBrandings.findOne({
      where: { user_id: userId },
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
  }

  static async createBrandings(brandingData) {
    const createBranding = await db.ContractorBrandings.create(brandingData);
    await createBranding.save();
    return createBranding;
  }

  static async updateBrandings(userId, brandingData) {
    const [updateRowCount] = await db.ContractorBrandings.update(brandingData, {
      where: { user_id: userId }
    });
    if (updateRowCount === 0) {
      throw new NotFoundError("Brandings not found for the user");
    }
    return updateRowCount;
  }
}

module.exports = ContractorBrandingServices;
