const db = require("../../../models");
const { NotFoundError } = require("../../errors/CustomError");

class ContractorLicenseServices {
  static async getLicense(licenseId) {
    const license = await db.ContractorLicenses.findOne({
      where: {
        id: licenseId
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
    if (!license) throw new NotFoundError("License Not Found");
    return license;
  }

  static async getAllStates() {
    const states = await db.States.findAll({
      attributes: ["id", "state_code", "name"]
    });
    if (!states || states.length === 0)
      throw new NotFoundError("States Not Found");
    return states;
  }

  static async getUserLicenses(userId) {
    const licenses = await db.ContractorLicenses.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
    return licenses;
  }

  static async getStatesByIds(ids) {
    const states = await db.States.findAll({
      where: {
        id: ids
      },
      attributes: ["id", "state_code"]
    });
    if (!states || states.length === 0)
      throw new NotFoundError("States Not Found");
    return states;
  }

  static async createLicense(licenseData) {
    const createLicense = await db.ContractorLicenses.create(licenseData, {
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await createLicense.save();
    return createLicense;
  }

  static async updateLicense(licenseId, licenseData) {
    const [updateRowCount] = await db.ContractorLicenses.update(licenseData, {
      where: { id: licenseId }
    });
    if (updateRowCount === 0) {
      throw new NotFoundError("Update Function Failed");
    }
    return updateRowCount;
  }

  static async deleteLicense(licenseId) {
    const deleteRowCount = await db.ContractorLicenses.destroy({
      where: { id: licenseId }
    });
    if (deleteRowCount === 0) {
      throw new NotFoundError("License Not Found");
    }
    return deleteRowCount;
  }
}

module.exports = ContractorLicenseServices;
