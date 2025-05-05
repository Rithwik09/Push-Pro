"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProjectServices extends Model {
    static associate(models) {
      models.ProjectServices.belongsTo(models.Projects, {
        foreignKey: "project_id",
        as: "pid",
        onDelete: "CASCADE"
      });
      models.ProjectServices.belongsTo(models.Services, {
        foreignKey: "service_id",
        as: "sid"
      });
    }
  }
  ProjectServices.init(
    {
      project_id: DataTypes.INTEGER,
      service_id: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "ProjectServices",
      tableName: "project_services",
      timestamps: false
    }
  );
  return ProjectServices;
};
