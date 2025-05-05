"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      email_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
        defaultValue: null
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      phone_no: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      is_contractor: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_customer: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verification_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      notification_email: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      notification_sms: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: Sequelize.ENUM("Active", "Inactive"),
        defaultValue: "Inactive"
      },
      profile_url: {
        type: Sequelize.STRING(255),
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
      "TRUNCATE TABLE users RESTART IDENTITY CASCADE"
    );
  }
};
