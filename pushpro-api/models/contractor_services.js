"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractorServices extends Model {
    static associate(models) {
      models.ContractorServices.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "uid5"
      });
      models.ContractorServices.belongsTo(models.Services, {
        foreignKey: "service_id",
        as: "sid3"
      });
    }
  }
  ContractorServices.init(
    {
      user_id: DataTypes.INTEGER,
      service_id: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "ContractorServices",
      tableName: "contractor_services",
      timestamps: false
    }
  );
  return ContractorServices;
};
