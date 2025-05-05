"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserSocialLinks extends Model {
    static associate(models) {
      models.UserSocialLinks.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "uid"
      });
    }
  }
  UserSocialLinks.init(
    {
      user_id: DataTypes.INTEGER,
      social_links: DataTypes.JSON
    },
    {
      sequelize,
      modelName: "UserSocialLinks",
      tableName: "user_social_links",
      timestamps: true
    }
  );
  return UserSocialLinks;
};
