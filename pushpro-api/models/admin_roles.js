"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class admin_roles extends Model {
    static associate(models) {}
  }
  admin_roles.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      status: DataTypes.BOOLEAN,
      permissions: DataTypes.JSON
    },
    {
      sequelize,
      modelName: "admin_roles"
    }
  );
  return admin_roles;
};
