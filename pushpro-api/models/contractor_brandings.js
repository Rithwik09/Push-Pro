"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractorBrandings extends Model {
    static associate(models) {
      models.ContractorBrandings.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "uid6"
      });
    }
  }
  ContractorBrandings.init(
    {
      user_id: DataTypes.INTEGER,
      main_logo: DataTypes.STRING,
      toggle_logo: DataTypes.STRING,
      main_logo_dark: DataTypes.STRING,
      toggle_logo_dark: DataTypes.STRING,
      theme_data: DataTypes.JSON
    },
    {
      sequelize,
      modelName: "ContractorBrandings",
      tableName: "contractor_brandings",
      timestamps: true
    }
  );
  return ContractorBrandings;
};
