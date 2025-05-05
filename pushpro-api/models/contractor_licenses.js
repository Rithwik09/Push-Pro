"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractorLicenses extends Model {
    static associate(models) {
      models.ContractorLicenses.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "user4"
      });
      models.ContractorLicenses.belongsTo(models.Services, {
        foreignKey: "service_id",
        as: "service3"
      });
    }
  }
  ContractorLicenses.init(
    {
      user_id: DataTypes.INTEGER,
      service_id: DataTypes.INTEGER,
      license_number: DataTypes.STRING,
      nationwide: DataTypes.BOOLEAN,
      license_states: DataTypes.JSON,
      license_url: DataTypes.STRING,
      expiration_date: DataTypes.DATE,
      visible_on_profile: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: "ContractorLicenses",
      tableName: "contractor_licenses",
      timestamps: true
    }
  );
  return ContractorLicenses;
};
