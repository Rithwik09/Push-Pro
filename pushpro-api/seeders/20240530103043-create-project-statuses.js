"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const statusData = [
      { status: "Drafted" },
      { status: "Requirements Received" },
      { status: "Estimation Created" },
      { status: "Estimation Sent" },
      { status: "Estimation Approved" },
      { status: "Estimation Rejected" },
      { status: "In Progress" },
      { status: "Completed" }
    ];
    await queryInterface.bulkInsert("project_statuses", statusData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE project_statuses RESTART IDENTITY CASCADE"
    );
  }
};
