"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Services extends Model {
    static associate(models) {}
  }
  Services.init(
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Services",
      tableName: "services",
      timestamps: false
    }
  );
  return Services;
};
