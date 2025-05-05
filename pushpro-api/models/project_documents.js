"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProjectDocuments extends Model {
    static associate(models) {
      models.ProjectDocuments.belongsTo(models.Projects, {
        foreignKey: "project_id",
        as: "pid2",
        onDelete: "CASCADE"
      });
    }
  }
  ProjectDocuments.init(
    {
      project_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      file_url: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "ProjectDocuments",
      tableName: "project_documents",
      timestamps: true
    }
  );
  return ProjectDocuments;
};
