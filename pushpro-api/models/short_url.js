"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ShortUrl extends Model {
    static associate(models) {
      ShortUrl.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "user"
      });
    }
  }

  ShortUrl.init(
    {
      user_id: DataTypes.INTEGER,
      short_url: DataTypes.STRING,
      short_url2: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "ShortUrl",
      tableName: "short_urls",
      timestamps: true
    }
  );

  return ShortUrl;
};
