"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractorInvites extends Model {
    static associate(models) {
      models.ContractorInvites.belongsTo(models.Users, {
        foreignKey: "id",
        as: "con_id"
      });
    }
  }
  ContractorInvites.init(
    {
      contractor_id: DataTypes.INTEGER,
      users: DataTypes.ARRAY(DataTypes.STRING),
      type: DataTypes.ENUM("Email", "SMS"),
      message: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: "ContractorInvites",
      tableName: "contractor_invites",
      timestamps: true
    }
  );
  return ContractorInvites;
};
