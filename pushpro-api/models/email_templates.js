"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class email_templates extends Model {
    static associate(models) {}
  }
  email_templates.init(
    {
      name: DataTypes.STRING,
      subject: DataTypes.STRING,
      email_body: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: "EmailTemplates",
      tableName: "email_templates"
    }
  );
  return email_templates;
};
