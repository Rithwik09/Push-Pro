"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {}
  }
  Users.init(
    {
      user_uuid: DataTypes.UUID,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email_address: DataTypes.STRING,
      password: DataTypes.STRING,
      phone_no: DataTypes.STRING,
      is_contractor: DataTypes.BOOLEAN,
      is_customer: DataTypes.BOOLEAN,
      is_verified: DataTypes.BOOLEAN,
      verification_code: DataTypes.STRING,
      notification_email: DataTypes.BOOLEAN,
      notification_sms: DataTypes.BOOLEAN,
      is_guided: DataTypes.BOOLEAN,
      status: DataTypes.ENUM("Active", "Inactive"),
      profile_url: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "users",
      timestamps: true
    }
  );
  return Users;
};
