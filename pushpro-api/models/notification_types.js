"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class NotificationType extends Model {
    static associate(models) {}
  }

  NotificationType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "NotificationType",
      tableName: "notification_types",
      timestamps: false
    }
  );

  return NotificationType;
};
