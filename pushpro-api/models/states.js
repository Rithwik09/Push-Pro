"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class states extends Model {
    static associate(models) {}
  }
  states.init(
    {
      state_code: DataTypes.STRING,
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "States",
      tableName: "states",
      timestamps: true
    }
  );
  return states;
};
