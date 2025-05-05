"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports =  {
  async up(queryInterface, Sequelize) {
  await queryInterface.dropTable("item_taxes");
  await queryInterface.dropTable("taxes");
}
}
