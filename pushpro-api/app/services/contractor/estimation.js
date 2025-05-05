const db = require("../../../models");
const APIFeature = require("../../../utils/APIFeature");
const { NotFoundError, ValidationError } = require("../../errors/CustomError");
const { Op } = require("sequelize");

class EstimationServices {
  static async getAll({ pageNo, limit, search, condition }) {
    const estimations = new APIFeature({ query: db.Estimations, limit });
    if (search) {
      estimations.search({ title: search });
    }
    if (condition) {
      estimations.whereAnd(condition);
    }
    estimations.projection([
      "id",
      "project_id",
      "contractor_id",
      "estimation_no",
      "estimation_date",
      "estimation_url",
      "po_number",
      "material_margin",
      "sub_total",
      "total",
      "estimation_status_id",
      "contract_text"
    ]);
    estimations.orderBy([["createdAt", "DESC"]]);
    estimations.paginate(pageNo || 1);
    const result = await estimations.exec();
    return {
      estimations: result?.rows,
      totalPage: estimations.getTotalPages()
    };
  }

  static async getById(id) {
    const estimations = await db.Estimations.findOne({
      where: { id: id },
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
    if (!estimations) {
      throw new NotFoundError("Estimation not found");
    }
    return estimations;
  }

  static async getByContractorId(id) {
    const estimations = await db.Estimations.findAll({
      where: { contractor_id: id },
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      },
      order: [["createdAt", "DESC"]]
    });
    if (!estimations) {
      throw new NotFoundError("Estimation not found");
    }
    return estimations;
  }

  static async getByProjectAndContractorId(projectId, contractorId) {
    const estimate = await db.Estimations.findOne({
      where: { project_id: projectId, contractor_id: contractorId },
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    });
    return estimate;
  }

  static async getByProjectId(id) {
    const estimations = await db.Estimations.findOne({
      where: { project_id: id }
    });
    if (!estimations) {
      throw new NotFoundError("Estimation not found");
    }
    return estimations;
  }

  static async getTotalEstimationRevenue(contractorId) {
    const result = await db.Estimations.findAll({
      where: { estimation_status_id: 2, contractor_id: contractorId },
      attributes: [
        [db.sequelize.fn("SUM", db.sequelize.col("total")), "total_revenue"]
      ]
    });
    return result[0];
  }

  static async getTotalRevenue(contractorId) {
    const result = await db.Estimations.findAll({
      where: { estimation_status_id: 3, contractor_id: contractorId },
      attributes: [
        [db.sequelize.fn("SUM", db.sequelize.col("total")), "total_earnings"]
      ]
    });
    return result[0];
  }

  static async createEstimation(payload) {
    const estimation = await db.Estimations.create(payload, {
      createdAt: new Date(),
      updatedAt: new Date()
    });
    if (!estimation) throw new ValidationError("Estimation Creation Failed");
    estimation.save();
    return estimation;
  }

  static async updateEstimation(id, payload) {
    let estimation = await this.getById(id);
    if (!estimation) throw new NotFoundError("Estimation not found");
    estimation = await db.Estimations.update(payload, {
      where: { id: id }
    });
    if (estimation === 0) {
      throw new NotFoundError("Estimation Updation Failed");
    }
    estimation = await this.getById(id);
    await estimation.save();
    return estimation;
  }

  static async getEstimatesByTime({ userId, startDate, endDate }) {
    const estimates = await db.Estimations.findAll({
      where: {
        contractor_id: userId,
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [["createdAt", "ASC"]]
    });

    // if (!estimates || estimates.length === 0) {
    //   throw new NotFoundError("No estimates found for the given period.");
    // }

    return estimates;
  }
  static async deleteEstimation(id) {
    const deleteRowCount = await db.Estimations.destroy({
      where: { id }
    });
    if (deleteRowCount === 0) {
      throw new NotFoundError("Estimation Deletion Failed");
    }
    return deleteRowCount;
  }
}

module.exports = EstimationServices;
