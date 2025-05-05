"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("contractor_brandings", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      main_logo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      toggle_logo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      main_logo_dark: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      toggle_logo_dark: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      theme_data: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE contractor_brandings RESTART IDENTITY CASCADE"
    );
  }
};
