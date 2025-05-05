"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProjectCommunications extends Model {
    static associate(models) {
      ProjectCommunications.belongsTo(models.Projects, {
        foreignKey: "project_id",
        as: "project",
        targetKey: "id",
        include: ["contractor_id", "customer_id", "title"]
      });
      ProjectCommunications.belongsTo(models.Users, {
        foreignKey: "receiver_id",
        as: "receiver",
        attributes: [
          "first_name",
          "last_name",
          "is_contractor",
          "is_customer",
          "status"
        ]
      });
      ProjectCommunications.belongsTo(models.Users, {
        foreignKey: "sender_id",
        as: "sender",
        attributes: [
          "first_name",
          "last_name",
          "is_contractor",
          "is_customer",
          "status"
        ]
      });
    }
  }

  ProjectCommunications.init(
    {
      project_id: DataTypes.INTEGER,
      receiver_id: DataTypes.INTEGER,
      sender_id: DataTypes.INTEGER,
      message: DataTypes.TEXT,
      attachment: DataTypes.STRING(255),
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "ProjectCommunications",
      tableName: "project_communications",
      timestamps: true
    }
  );

  return ProjectCommunications;
};
