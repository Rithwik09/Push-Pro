"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("company_details", "company_website");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("company_details", "company_website", {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });
  }
};
