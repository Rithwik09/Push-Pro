"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Items extends Model {
    static associate(models) {
      models.Items.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "user_data"
      });
      models.Items.belongsTo(models.ItemCategories, {
        foreignKey: "category_id",
        as: "item_category_data"
      });
    }
  }
  Items.init(
    {
      user_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      category_id: DataTypes.INTEGER,
      quantity: DataTypes.FLOAT,
      hours: DataTypes.FLOAT,
      quantity_per_hour: DataTypes.FLOAT,
      labour_cost: DataTypes.FLOAT,
      hourly_labour_rate: DataTypes.FLOAT,
      material_cost: DataTypes.FLOAT
    },
    {
      sequelize,
      modelName: "Items",
      tableName: "items",
      timestamps: true
    }
  );
  return Items;
};
