"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const servicesData = [
      { name: "Plumbing" },
      { name: "Electrical" },
      { name: "HVAC" },
      { name: "Siding" },
      { name: "Interior Paint" },
      { name: "Exterior Paint" },
      { name: "Roofing" },
      { name: "Drywall" },
      { name: "Concrete" },
      { name: "Tile" },
      { name: "Stone/Masonry/Brick/Stucco" },
      { name: "Fence" },
      { name: "Deck" },
      { name: "Flooring (Epoxy)" },
      { name: "Flooring (LVP/Carpet)" },
      { name: "Insulation" },
      { name: "Countertops" },
      { name: "Cabinetry" },
      { name: "Gutters" },
      { name: "Landscaping" }
    ];
    await queryInterface.bulkInsert("services", servicesData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE services RESTART IDENTITY CASCADE"
    );
  }
};
