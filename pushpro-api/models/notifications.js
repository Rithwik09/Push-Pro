"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notifications extends Model {
    static associate(models) {
      Notifications.belongsTo(models.NotificationType, {
        foreignKey: "type_id",
        targetKey: "id",
        as: "type",
        onDelete: "CASCADE"
      });
      Notifications.belongsTo(models.Projects, {
        foreignKey: "project_id",
        as: "project",
        targetKey: "id",
        onDelete: "CASCADE"
      });
      Notifications.belongsTo(models.Users, {
        foreignKey: "id",
        as: "customer",
        targetKey: "id",
        attributes: [
          "first_name",
          "last_name",
          "is_contractor",
          "is_customer",
          "status"
        ],
        onDelete: "CASCADE"
      });
      Notifications.belongsTo(models.Users, {
        foreignKey: "id",
        as: "contractor",
        targetKey: "id",
        attributes: [
          "first_name",
          "last_name",
          "is_contractor",
          "is_customer",
          "status"
        ],
        onDelete: "CASCADE"
      });
    }
  }
  Notifications.init(
    {
      user_id: DataTypes.INTEGER,
      type_id: DataTypes.INTEGER,
      project_id: DataTypes.INTEGER,
      text: DataTypes.TEXT,
      link: DataTypes.STRING,
      is_read: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: "Notifications",
      tableName: "notifications",
      timestamps: true
    }
  );
  return Notifications;
};
