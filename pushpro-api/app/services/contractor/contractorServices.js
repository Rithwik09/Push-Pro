const db = require("../../../models");

class ContractorServices {
  static async getAllServices() {
    const services = await db.Services.findAll();
    return services;
  }

  static async getServicesByContractorId(user_id) {
    const services = await db.ContractorServices.findAll({
      where: { user_id: user_id }
    });
    return services;
  }

  static async createServices({ user_id, service_id }) {
    const service = await db.ContractorServices.create({ user_id, service_id });
    return service;
  }

  static async updateServices(id, name) {
    const service = await db.ContractorServices.update(
      { name },
      {
        where: { id: id }
      }
    );
    return service;
  }

  static async deleteServices(user_id) {
    const service = await db.ContractorServices.destroy({
      where: { user_id: user_id }
    });
    return service;
  }

  static async searchContractorsByServices(services, associatedContractorIds) {
    const contractors = await db.ContractorServices.findAll({
      where: {
        user_id: associatedContractorIds,
        service_id: services
      },
      include: [
        {
          model: db.Users,
          as: "uid5",
          attributes: [
            "id",
            "user_uuid",
            "first_name",
            "last_name",
            "email_address",
            "phone_no"
          ]
        }
      ]
    });
    return contractors.map((contractor) => contractor.uid5);
  }
}

module.exports = ContractorServices;
