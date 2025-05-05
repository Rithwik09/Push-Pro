"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("system_modules", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      module_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: null
      },
      action: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      parent_module_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      is_permissible: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
      "TRUNCATE TABLE system_modules RESTART IDENTITY CASCADE"
    );
  }
};
