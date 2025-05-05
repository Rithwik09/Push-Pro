"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CompanyDetails extends Model {
    static associate(models) {
      models.CompanyDetails.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "uid9"
      });
    }
  }
  CompanyDetails.init(
    {
      user_id: DataTypes.INTEGER,
      company_name: DataTypes.STRING,
      phone_no: DataTypes.STRING,
      address_line_1: DataTypes.STRING,
      address_line_2: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      country: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      business_id: DataTypes.STRING,
      company_email: DataTypes.STRING,
      contract_text: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: "CompanyDetails",
      tableName: "company_details",
      timestamps: true
    }
  );
  return CompanyDetails;
};
