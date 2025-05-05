"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the new columns
    await queryInterface.addColumn("projects", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporarily allow null to handle existing data
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    await queryInterface.addColumn("projects", "modified_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Update created_by to match customer_id or default to a fallback user
    const defaultUserId = 1; // Replace with an actual default system user ID
    await queryInterface.sequelize.query(`
      UPDATE projects
      SET created_by = COALESCE(customer_id, ${defaultUserId})
    `);

    // Set created_by column as NOT NULL
    await queryInterface.changeColumn("projects", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the new columns
    await queryInterface.removeColumn("projects", "created_by");
    await queryInterface.removeColumn("projects", "modified_by");
  },
};
