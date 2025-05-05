"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractorCertificates extends Model {
    static associate(models) {
      models.ContractorCertificates.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "uid8"
      });
    }
  }
  ContractorCertificates.init(
    {
      user_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      certificate_url: DataTypes.STRING,
      visible_on_profile: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: "ContractorCertificates",
      tableName: "contractor_certificates",
      timestamps: true
    }
  );
  return ContractorCertificates;
};
