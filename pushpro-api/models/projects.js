"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Projects extends Model {
    static associate(models) {
      models.Projects.belongsTo(models.Users, {
        foreignKey: "customer_id",
        as: "customer"
      });
      models.Projects.belongsTo(models.Users, {
        foreignKey: "contractor_id",
        as: "contractor"
      });
    }
  }
  Projects.init(
    {
      project_uuid: DataTypes.UUID,
      customer_id: DataTypes.INTEGER,
      contractor_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      address_line_1: DataTypes.STRING,
      address_line_2: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      date_preference: DataTypes.BOOLEAN,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      budget_preference: DataTypes.BOOLEAN,
      budget_min: DataTypes.DECIMAL,
      budget_max: DataTypes.DECIMAL,
      project_type: DataTypes.STRING,
      project_category: DataTypes.STRING,
      status_id: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      modified_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Projects",
      tableName: "projects",
      timestamps: true
    }
  );
  return Projects;
};
