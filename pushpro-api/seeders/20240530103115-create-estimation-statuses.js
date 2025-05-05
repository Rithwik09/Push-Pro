"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const statusData = [
      { status: "Estimation Created" },
      { status: "Estimation Sent" },
      { status: "Estimation Approved" },
      { status: "Estimation Rejected" }
    ];
    await queryInterface.bulkInsert("estimation_statuses", statusData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE estimation_statuses RESTART IDENTITY CASCADE"
    );
  }
};
