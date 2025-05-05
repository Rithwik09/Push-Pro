"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractorSubContractors extends Model {
    static associate(models) {
      models.ContractorSubContractors.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "subcontractor"
      });
      models.ContractorSubContractors.belongsTo(models.Users, {
        foreignKey: "contractor_id",
        as: "con3"
      });
    }
  }
  ContractorSubContractors.init(
    {
      user_id: DataTypes.INTEGER,
      contractor_id: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "ContractorSubContractors",
      tableName: "contractor_subcontractors",
      timestamps: true
    }
  );
  return ContractorSubContractors;
};
