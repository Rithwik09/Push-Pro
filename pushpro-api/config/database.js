const { Sequelize } = require("sequelize");

// Initialize Sequelize with PostgreSQL configuration
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Database user
  process.env.DB_PASSWORD, // Database password
  {
    host: process.env.DB_HOST, // Database host
    dialect: process.env.DB // Change this to 'postgres'
  }
);

// Sync the database (create tables if they don't exist)
sequelize.sync();
(async () => {
  try {
    // Authenticate the connection
    await sequelize.authenticate();
  } catch (error) {
    console.error("Database Connection Error :", error);
  }
})();

// Export the sequelize instance
module.exports = sequelize;
