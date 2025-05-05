const db = require("../../../models");
const APIFeature = require("../../../utils/APIFeature");

class ContractorInvitesServices {
  static async getAllInvites(query) {
    const feature = new APIFeature(db.ContractorInvites, query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const invites = await feature.query;
    return invites;
  }

  static async getInvite(query) {
    const invite = await db.ContractorInvites.findOne({ where: query });
    if (!invite) return false;
    return invite;
  }

  static async createInvite(data) {
    const invite = await db.ContractorInvites.create(data);
    if (invite) return invite;
    else return false;
  }

  static async deleteInvite(query) {
    const invite = await db.ContractorInvites.destroy({ where: query });
    if (!invite) return false;
    return invite;
  }

  static async updateInvite(query, data) {
    const invite = await db.ContractorInvites.update(data, { where: query });
    if (!invite) return false;
    return invite;
  }
}

module.exports = ContractorInvitesServices;
