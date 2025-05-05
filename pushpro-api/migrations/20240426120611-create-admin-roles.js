"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_roles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      permissions: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
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

    await queryInterface.bulkInsert(
      "admin_roles",
      [
        {
          name: "Super Admin",
          description: "Super Admin",
          status: true,
          permissions: null,
          createdAt: new Date()
        }
      ],
      {}
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE admin_roles RESTART IDENTITY CASCADE"
    );
    // await queryInterface.dropTable('admin_roles');
  }
};
