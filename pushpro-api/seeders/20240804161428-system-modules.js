"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const timestamp = new Date();

    await queryInterface.bulkDelete("system_modules", null, {
      truncate: true, // This will truncate the table and reset the auto-increment id
      restartIdentity: true, // Resets the auto-increment counter
      cascade: true // This will also delete records from any associated tables that have foreign keys
    });

    await queryInterface.bulkInsert(
      "system_modules",
      [
        {
          module_name: "Dashboard",
          action: JSON.stringify([]),
          slug: "dashboard",
          icon: null,
          parent_module_id: null,
          is_permissible: true,
          status: true,
          display_order: 1,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          module_name: "User Management",
          action: JSON.stringify([]),
          slug: null,
          icon: null,
          parent_module_id: null,
          is_permissible: true,
          status: true,
          display_order: 2,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          module_name: "Manage Users",
          action: JSON.stringify([]),
          slug: "users",
          icon: null,
          parent_module_id: 2,
          is_permissible: true,
          status: null,
          display_order: 3,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          module_name: "Manage Roles",
          action: JSON.stringify([]),
          slug: "roles",
          icon: null,
          parent_module_id: 2,
          is_permissible: true,
          status: true,
          display_order: 4,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          module_name: "Contractors",
          action: JSON.stringify([]),
          slug: "contractors",
          icon: null,
          parent_module_id: null,
          is_permissible: true,
          status: true,
          display_order: 5,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          module_name: "Customers",
          action: JSON.stringify([]),
          slug: "customers",
          icon: null,
          parent_module_id: null,
          is_permissible: true,
          status: true,
          display_order: 6,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          module_name: "Project Management",
          action: JSON.stringify([]),
          slug: "project-management",
          icon: null,
          parent_module_id: null,
          is_permissible: true,
          status: null,
          display_order: 7,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          module_name: "Settings",
          action: JSON.stringify([]),
          slug: null,
          icon: null,
          parent_module_id: null,
          is_permissible: true,
          status: true,
          display_order: 8,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          module_name: "Email Template",
          action: JSON.stringify([]),
          slug: "email-template",
          icon: null,
          parent_module_id: 8,
          is_permissible: true,
          status: null,
          display_order: 9,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("system_modules", null, {
      truncate: true, // This will truncate the table and reset the auto-increment id
      restartIdentity: true, // Resets the auto-increment counter
      cascade: true // This will also delete records from any associated tables that have foreign keys
    });
  }
};
