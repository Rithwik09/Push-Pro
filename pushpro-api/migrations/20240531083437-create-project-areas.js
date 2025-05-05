"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_areas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "projects",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      area_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "areas",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE project_areas RESTART IDENTITY CASCADE"
    );
  }
};
