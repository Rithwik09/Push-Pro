const db = require("../../../../models");
const APIFeature = require("../../../../utils/APIFeature");
const {
  NotFoundError,
  ValidationError
} = require("../../../errors/CustomError");

class EstimationItemsServices {
  static async getAll({ pageNo, limit, search, condition }) {
    const estimations = new APIFeature({ query: db.EstimationItems, limit });
    if (search) {
      estimations.search({ title: search });
    }
    if (condition) {
      estimations.whereAnd(condition);
    }
    estimations.projection([
      "id",
      "estimation_id",
      "item_id",
      "category_id",
      "title",
      "description",
      "quantity",
      "hours",
      "quantity_per_hour",
      "labour_cost",
      "hourly_labour_rate",
      "material_cost",
      "tax",
      "position",
      "createdAt"
    ]);
    estimations.orderBy([["createdAt", "DESC"]]);
    estimations.paginate(pageNo || 1);
    const result = await estimations.exec();
    return {
      estimations: result?.rows,
      totalPage: estimations.getTotalPages()
    };
  }

  // static async getAllByEstimationId(id) {
  //   const estimations = await this.getAll({ condition: { estimation_id: id } });
  //   if (!estimations) throw new NotFoundError("Estimation Items Not Found");
  //   return estimations;
  // }

  static async getById(id) {
    const estimation = await db.EstimationItems.findOne({
      where: { id }
    });
    if (!estimation) {
      throw new NotFoundError("Estimation Item not found");
    }
    return estimation;
  }

  static async createEstimationItem(id, payload) {
    payload.estimation_id = id;
    const estimationItem = await db.EstimationItems.create(payload);
    if (!estimationItem) {
      throw new ValidationError("Estimation Item Creation Failed");
    }
    estimationItem.save();
    return estimationItem;
  }

  static async updateEstimationItem(id, payload) {
    let estimationItem = await this.getById(id);
    if (!estimationItem) throw new NotFoundError("Estimation Item not found");
    estimationItem = await db.EstimationItems.update(payload, {
      where: { id: id }
    });
    if (estimationItem === 0) {
      throw new NotFoundError("Estimation Item Updation Failed");
    }
    estimationItem = await this.getById(id);
    return estimationItem;
  }

  static async deleteEstimationItem(id) {
    const deleteRowCount = await db.EstimationItems.destroy({
      where: { id }
    });
    if (deleteRowCount === 0) {
      throw new NotFoundError("Estimation Item Deletion Failed");
    }
    return deleteRowCount;
  }
}

module.exports = EstimationItemsServices;
