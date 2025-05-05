const db = require("../../../models");
const { NotFoundError } = require("../../errors/CustomError");

class ContractorInsuranceServices {
  static async getInsurance(insuranceId, userId) {
    const insurance = await db.ContractorInsurances.findOne({
      where: {
        id: insuranceId,
        user_id: userId
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
    if (!insurance) {
      throw new NotFoundError("Insurance Not Found");
    }
    return insurance;
  }

  static async getUserInsurances(userId) {
    return await db.ContractorInsurances.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
  }

  static async createInsurance(insuranceData) {
    const createInsurance = await db.ContractorInsurances.create(insuranceData);
    await createInsurance.save();
    return createInsurance;
  }

  static async updateInsurance(insuranceId, insuranceData) {
    const [updateRowCount] = await db.ContractorInsurances.update(
      insuranceData,
      {
        where: { id: insuranceId }
      }
    );
    if (updateRowCount === 0) {
      throw new NotFoundError("Insurance Not Found");
    }
    return updateRowCount;
  }

  static async deleteInsurance(insuranceId) {
    const deleteRowCount = await db.ContractorInsurances.destroy({
      where: { id: insuranceId }
    });
    if (deleteRowCount === 0) {
      throw new NotFoundError("Insurance Not Found");
    }
    return deleteRowCount;
  }
}

module.exports = ContractorInsuranceServices;
