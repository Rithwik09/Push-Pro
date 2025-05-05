"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EstimationStatuses extends Model {
    static associate(models) {}
  }
  EstimationStatuses.init(
    {
      status: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "EstimationStatuses",
      tableName: "estimation_statuses",
      timestamps: false
    }
  );
  return EstimationStatuses;
};
