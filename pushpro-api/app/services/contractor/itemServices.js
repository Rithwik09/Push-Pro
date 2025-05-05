const db = require("../../../models");
const { ValidationError, NotFoundError } = require("../../errors/CustomError");
const APIFeature = require("../../../utils/APIFeature");

class ContractorItemServices {
  static async getAllCategories() {
    const categories = await db.ItemCategories.findAll();
    if (!categories || categories.length === 0)
      throw new NotFoundError("Categories Not Found");
    return categories;
  }

  static async getItemCategoryById(id) {
    const category = await db.ItemCategories.findOne({
      where: { id }
    });
    if (!category) throw new NotFoundError("Category Not Found");
    return category;
  }

  static async getById(itemId) {
    const item = await db.Items.findOne({
      where: {
        id: itemId
      }
    });
    if (!item) throw new NotFoundError("Item Not Found");
    return item;
  }

  static async getAll({ pageNo, limit, search, condition }) {
    const items = new APIFeature({ query: db.Items, limit });
    const Op = db.Sequelize.Op;
    if (search) {
      if (!isNaN(search)) {
        items.specificSearch({
          [Op.or]: [{ category_id: search }, { user_id: search }]
        });
      } else {
        items.specificSearch({
          title: { [Op.iLike]: `%${search}%` }
        });
      }
    }
    if (condition) {
      const whereConditions = {};
      for (const key in condition) {
        if (condition[key]) {
          if (typeof condition[key] === "string") {
            whereConditions[key] = { [Op.iLike]: `%${condition[key]}%` };
          } else {
            whereConditions[key] = condition[key];
          }
        }
      }
      items.whereAnd(whereConditions);
    }
    items.includes([
      {
        model: db.ItemCategories,
        as: "item_category_data"
      }
    ]);
    items.projection([
      "id",
      "user_id",
      "category_id",
      "title",
      "description",
      "quantity",
      "hours",
      "quantity_per_hour",
      "labour_cost",
      "hourly_labour_rate",
      "material_cost"
    ]);
    // items.orderBy([["createdAt", "DESC"]]);
    items.paginate(pageNo || 1);
    const result = await items.exec();
    const categories = await this.getAllCategories();
    return {
      items: result?.rows || [],
      totalPage: items.getTotalPages(),
      totalItems: items.getTotalItems(),
      categories
    };
  }

  static async getItemByContractorId(id) {
    const items = await this.getAll({ condition: { user_id: id } });
    if (!items) throw new NotFoundError("Items Not Found");
    return items;
  }

  static async createItem(user_id, cat_id, payload) {
    await this.getItemCategoryById(cat_id);
    const createItem = await db.Items.create({
      user_id: user_id,
      category_id: cat_id,
      title: payload.title,
      description: payload.description || "",
      quantity: payload.quantity || 0,
      hours: payload.hours || 0,
      quantity_per_hour: payload.quantity_per_hour || 0,
      labour_cost: payload.labour_cost || 0,
      hourly_labour_rate: payload.hourly_labour_rate || 0,
      material_cost: payload.material_cost || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    if (!createItem) throw new ValidationError("Item Creation Failed");
    return createItem;
  }

  static async updateItem(itemId, payload) {
    let item = await this.getById(itemId);
    const [updateRowCount] = await db.Items.update(
      {
        ...payload,
        updatedAt: new Date()
      },
      {
        where: { id: itemId }
      }
    );
    if (updateRowCount === 0) {
      throw new NotFoundError("Item Updation Failed");
    }
    item = await this.getById(itemId);
    return item;
  }

  static async deleteItem(itemId) {
    await this.getById(itemId);
    const deleteRowCount = await db.Items.destroy({
      where: { id: itemId }
    });
    if (deleteRowCount === 0) {
      throw new NotFoundError("Item Deletion Failed");
    }
    return deleteRowCount;
  }
}

module.exports = ContractorItemServices;
