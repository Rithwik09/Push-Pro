"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AddressBook extends Model {
    static associate(models) {
      models.AddressBook.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "u5"
      });
    }
  }
  AddressBook.init(
    {
      user_id: DataTypes.INTEGER,
      address_line_1: DataTypes.STRING,
      address_line_2: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      country: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      status: DataTypes.ENUM("Active", "Inactive")
    },
    {
      sequelize,
      modelName: "AddressBook",
      tableName: "address_books",
      timestamps: true
    }
  );
  return AddressBook;
};
