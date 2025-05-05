"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const areasData = [
      { name: "Bedroom" },
      { name: "Bathroom" },
      { name: "Kitchen" },
      { name: "Garage" },
      { name: "Flooring" },
      { name: "Ceiling" },
      { name: "Office" },
      { name: "Theatre" },
      { name: "Other" }
    ];
    await queryInterface.bulkInsert("areas", areasData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE areas RESTART IDENTITY CASCADE"
    );
  }
};
