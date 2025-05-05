"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("contractor_licenses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "services",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      license_number: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      nationwide: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      license_states: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },
      license_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      expiration_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      visible_on_profile: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
      "TRUNCATE TABLE contractor_licenses RESTART IDENTITY CASCADE"
    );
  }
};
