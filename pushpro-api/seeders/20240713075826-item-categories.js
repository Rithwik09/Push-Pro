"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categoriesData = [
      { category_title: "Appliances" },
      { category_title: "Carpentry" },
      { category_title: "Cleaning" },
      { category_title: "Concrete" },
      { category_title: "Countertops" },
      { category_title: "Damage Restoration" },
      { category_title: "Decking" },
      { category_title: "Demolition" },
      { category_title: "Doors & Windows" },
      { category_title: "Drywall & Plastering" },
      { category_title: "Electrical" },
      { category_title: "Equipment Rental" },
      { category_title: "Exterior Painting" },
      { category_title: "Fencing" },
      { category_title: "Flooring" },
      { category_title: "Garage Door" },
      { category_title: "HVAC" },
      { category_title: "Insulation" },
      { category_title: "Landscaping" },
      { category_title: "Maintenance & Repair" },
      { category_title: "Management & Design" },
      { category_title: "Masonry" },
      { category_title: "Millwork & Finish Carpentry" },
      { category_title: "Painting & Decorating" },
      { category_title: "Paving" },
      { category_title: "Plumbing" },
      { category_title: "Pool" },
      { category_title: "Roofing" },
      { category_title: "Sitework" },
      { category_title: "Specialty" },
      { category_title: "Stone & Tile" },
      { category_title: "Window Coverings" }
    ];
    await queryInterface.bulkInsert("item_categories", categoriesData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE item_categories RESTART IDENTITY CASCADE"
    );
  }
};
