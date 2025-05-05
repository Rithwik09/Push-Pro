"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProjectAreas extends Model {
    static associate(models) {
      models.ProjectAreas.belongsTo(models.Projects, {
        foreignKey: "project_id",
        as: "pid3",
        onDelete: "CASCADE"
      });
    }
  }
  ProjectAreas.init(
    {
      project_id: DataTypes.INTEGER,
      area_id: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "ProjectAreas",
      tableName: "project_areas",
      timestamps: false
    }
  );
  return ProjectAreas;
};
