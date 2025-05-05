"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ItemCategories extends Model {
    static associate(models) {}
  }
  ItemCategories.init(
    {
      category_title: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "ItemCategories",
      tableName: "item_categories",
      timestamps: false
    }
  );
  return ItemCategories;
};
