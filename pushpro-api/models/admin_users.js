"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AdminUsers extends Model {
    static associate(models) {
      AdminUsers.belongsTo(models.admin_roles, {
        foreignKey: "role_id",
        as: "role",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      });
    }
  }
  AdminUsers.init(
    {
      role_id: DataTypes.INTEGER,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email_address: DataTypes.STRING,
      password: DataTypes.STRING,
      phone_no: DataTypes.STRING,
      verification_code: DataTypes.STRING,
      status: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: "AdminUsers",
      tableName: "admin_users",
      timestamps: true
    }
  );
  return AdminUsers;
};
