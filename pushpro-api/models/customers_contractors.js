"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CustomersContractors extends Model {
    static associate(models) {
      models.CustomersContractors.belongsTo(models.Users, {
        foreignKey: "customer_id",
        as: "cus2"
      });
      models.CustomersContractors.belongsTo(models.Users, {
        foreignKey: "contractor_id",
        as: "con2"
      });
    }
  }
  CustomersContractors.init(
    {
      customer_id: DataTypes.INTEGER,
      contractor_id: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "CustomersContractors",
      tableName: "customers_contractors",
      timestamps: true
    }
  );
  return CustomersContractors;
};
