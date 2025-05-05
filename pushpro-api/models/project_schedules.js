"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProjectSchedules extends Model {
    static associate(models) {
      models.ProjectSchedules.belongsTo(models.Projects, {
        foreignKey: "project_id",
        as: "project",
        onDelete: "cascade"
      });
      models.ProjectSchedules.belongsTo(models.Users, {
        foreignKey: "customer_id",
        as: "customer",
        onDelete: "cascade"
      });
      models.ProjectSchedules.belongsTo(models.Users, {
        foreignKey: "contractor_id",
        as: "contractor",
        onDelete: "cascade"
      });
      models.ProjectSchedules.belongsTo(models.Users, {
        foreignKey: "created_by",
        as: "creator"
      });
    }
  }
  ProjectSchedules.init(
    {
      project_id: DataTypes.INTEGER,
      contractor_id: DataTypes.INTEGER,
      customer_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      start_time: DataTypes.DATE,
      end_time: DataTypes.DATE,
      status: DataTypes.ENUM("Accepted", "Rejected", "Pending"),
      created_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "ProjectSchedules",
      tableName: "project_schedules",
      timestamps: true
    }
  );
  return ProjectSchedules;
};
