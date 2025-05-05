"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("company_details", "company_mob_no");
    await queryInterface.removeColumn("company_details", "company_fax_no");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("company_details", "company_mob_no", {
      type: Sequelize.STRING(30),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("company_details", "company_fax_no", {
      type: Sequelize.STRING(30),
      allowNull: true,
      defaultValue: null
    });
  }
};
