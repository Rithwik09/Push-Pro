"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProjectStatuses extends Model {
    static associate(models) {}
  }
  ProjectStatuses.init(
    {
      status: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "ProjectStatuses",
      tableName: "project_statuses",
      timestamps: false
    }
  );
  return ProjectStatuses;
};
