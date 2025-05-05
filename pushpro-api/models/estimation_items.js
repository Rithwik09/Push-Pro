"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EstimationItems extends Model {
    static associate(models) {
      models.EstimationItems.belongsTo(models.Estimations, {
        foreignKey: "estimation_id",
        as: "eid"
      });
      models.EstimationItems.belongsTo(models.Items, {
        foreignKey: "item_id",
        as: "item2"
      });
      models.EstimationItems.belongsTo(models.ItemCategories, {
        foreignKey: "category_id",
        as: "cgid2"
      });
    }
  }
  EstimationItems.init(
    {
      estimation_id: DataTypes.INTEGER,
      item_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      category_id: DataTypes.INTEGER,
      quantity: DataTypes.FLOAT,
      hours: DataTypes.FLOAT,
      quantity_per_hour: DataTypes.FLOAT,
      labour_cost: DataTypes.FLOAT,
      hourly_labour_rate: DataTypes.FLOAT,
      material_cost: DataTypes.FLOAT,
      tax: DataTypes.FLOAT,
      position: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "EstimationItems",
      tableName: "estimation_items",
      timestamps: true
    }
  );
  return EstimationItems;
};
