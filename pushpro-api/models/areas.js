"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Areas extends Model {
    static associate(models) {}
  }
  Areas.init(
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Areas",
      tableName: "areas",
      timestamps: false
    }
  );
  return Areas;
};
