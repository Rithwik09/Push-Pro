"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("address_books", {
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
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: Sequelize.ENUM("Active", "Inactive"),
        allowNull: true,
        defaultValue: "Inactive"
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
    await queryInterface.dropTable("address_books");
  }
};
