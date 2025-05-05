"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("notification_types", [
      {
        id: 1,
        title: "Requirements Received"
      },
      {
        id: 2,
        title: "Estimation Reviewed By Customer"
      },
      {
        id: 3,
        title: "Comments from Customer"
      },
      {
        id: 4,
        title: "Estimation Created"
      },
      {
        id: 5,
        title: "Estimation Received"
      },
      {
        id: 6,
        title: "Estimation Approved"
      },
      {
        id: 7,
        title: "Estimation Rejected"
      },
      {
        id: 8,
        title: "Comments from Contractor"
      },
      {
        id: 9,
        title: "Work Started"
      },
      {
        id: 10,
        title: "Work Completed"
      },
      {
        id: 11,
        title: "New Message Received"
      },
      {
        id: 12,
        title: "Meeting Requested"
      },
      {
        id: 13,
        title: "Meeting Approved"
      },
      {
        id: 14,
        title: "Meeting Rejected"
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE notification_types RESTART IDENTITY CASCADE"
    );
  }
};
