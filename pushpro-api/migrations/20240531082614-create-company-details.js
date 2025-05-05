"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("company_details", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
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
      company_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      phone_no: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      address_line_1: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      address_line_2: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      zip_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: null
      },
      business_id: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      company_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      company_mob_no: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      company_fax_no: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      company_website: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      contract_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ""
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE company_details RESTART IDENTITY CASCADE"
    );
  }
};
