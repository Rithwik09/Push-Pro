"use strict";
const bcrypt = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "admin_roles",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
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
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      verification_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null
      }
    });

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    await queryInterface.bulkInsert('admin_users', [
      {
        role_id: 1,
        first_name: "Admin",
        last_name: "Admin",
        email_address: "admin@pushpro.com",
        password: await bcrypt.hash("Admin@123", saltRounds),
        phone_no: "1234567891",
        status: true,
        createdAt: new Date(),
      }
    ], {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE admin_users RESTART IDENTITY CASCADE"
    );
  }
};
