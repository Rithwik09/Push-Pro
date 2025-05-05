"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractorInsurances extends Model {
    static associate(models) {
      models.ContractorInsurances.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "uid7"
      });
    }
  }
  ContractorInsurances.init(
    {
      user_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      insurance_url: DataTypes.STRING,
      expiration_date: DataTypes.DATE,
      visible_on_profile: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: "ContractorInsurances",
      tableName: "contractor_insurances",
      timestamps: true
    }
  );
  return ContractorInsurances;
};
