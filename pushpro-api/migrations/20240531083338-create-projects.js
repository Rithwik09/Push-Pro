"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projects", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      contractor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      description: {
        type: Sequelize.TEXT,
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
      zip_code: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      date_preference: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      budget_preference: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      budget_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      },
      budget_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      },
      project_type: {
        type: Sequelize.ENUM("Commercial", "Residential"),
        allowNull: true
      },
      project_category: {
        type: Sequelize.ENUM("Renovation", "Addition"),
        allowNull: true
      },
      status_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        references: {
          model: "project_statuses",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
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
      "TRUNCATE TABLE projects RESTART IDENTITY CASCADE"
    );
  }
};
