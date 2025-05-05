"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let relation = [
      {
        customer_id: 3,
        contractor_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        customer_id: 4,
        contractor_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert("customers_contractors", relation, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE customers_contractors RESTART IDENTITY CASCADE"
    );
  }
};
