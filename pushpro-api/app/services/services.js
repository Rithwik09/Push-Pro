const db = require("../../models");
const { NotFoundError } = require("../errors/CustomError");

class ContractorServices {
  static async getAllServices() {
    const services = await db.Services.findAll();
    return services;
  }

  static async getProjectServices(projectId) {
    const project = await db.Projects.findOne({
      where: { id: projectId }
    });
    if (!project) throw new Error("Project Not Found");
    const projectServices = await db.ProjectServices.findAll({
      where: { project_id: projectId },
      attributes: ["id", "project_id", "service_id"]
    });
    if (!projectServices) throw new Error("Project Services Not Found");
    return projectServices;
  }

  static async setProjectServices(projectId, services) {
    const project = await db.Projects.findOne({
      where: { id: projectId }
    });
    if (!project) throw new Error("Project Not Found");
    let projectServices = [];
    projectServices = await db.ProjectServices.destroy({
      where: { project_id: projectId }
    });
    for (let i = 0; i < services.length; i++) {
      projectServices = await db.ProjectServices.create(
        { project_id: projectId, service_id: services[i] },
        { ignoreDuplicates: true }
      );
    }
    if (!projectServices || projectServices.length === 0)
      throw new NotFoundError("Project Services Creation Failed");
    return projectServices;
  }

  static async getServicesByContractorId(user_id) {
    const services = await db.ContractorServices.findAll({
      where: { user_id: user_id }
    });
    return services;
  }

  static async createServices(name) {
    const service = await db.Services.create({ name });
    return service;
  }

  static async updateServices(id, name) {
    const service = await db.Services.update(
      { name },
      {
        where: { id: id }
      }
    );
    return service;
  }

  static async deleteServices(id) {
    const service = await db.Services.destroy({
      where: { id: id }
    });
    return service;
  }
}

module.exports = ContractorServices;
