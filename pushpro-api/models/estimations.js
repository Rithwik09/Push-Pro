"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Estimations extends Model {
    static associate(models) {
      models.Estimations.belongsTo(models.Projects, {
        foreignKey: "project_id",
        as: "pid4"
      });
      models.Estimations.belongsTo(models.Users, {
        foreignKey: "contractor_id",
        as: "contractor2"
      });
      models.Estimations.belongsTo(models.EstimationStatuses, {
        foreignKey: "estimation_status_id",
        as: "esid"
      });
    }
  }
  Estimations.init(
    {
      project_id: DataTypes.INTEGER,
      contractor_id: DataTypes.INTEGER,
      estimation_no: DataTypes.STRING,
      estimation_date: DataTypes.DATE,
      po_number: DataTypes.STRING,
      labour_margin: DataTypes.FLOAT,
      material_margin: DataTypes.FLOAT,
      sub_total: DataTypes.FLOAT,
      total: DataTypes.FLOAT,
      estimation_status_id: DataTypes.SMALLINT,
      estimation_url: DataTypes.STRING,
      contract_text: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: "Estimations",
      tableName: "estimations",
      timestamps: true
    }
  );
  return Estimations;
};
