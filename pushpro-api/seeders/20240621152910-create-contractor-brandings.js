"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let data = [
      {
        user_id: 1,
        main_logo: "",
        toggle_logo: "",
        main_logo_dark: "",
        toggle_logo_dark: "",
        theme_data: JSON.stringify({
          ynexMenu: "color",
          primaryRGB: "152, 172, 54",
          dynamiccolor: "152, 172, 54",
          greyRGB: "18, 30, 40"
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        main_logo: "",
        toggle_logo: "",
        main_logo_dark: "",
        toggle_logo_dark: "",
        theme_data: JSON.stringify({
          ynexMenu: "color",
          primaryRGB: "152, 172, 54",
          dynamiccolor: "152, 172, 54",
          greyRGB: "18, 30, 40"
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert("contractor_brandings", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE contractor_brandings RESTART IDENTITY CASCADE"
    );
  }
};
