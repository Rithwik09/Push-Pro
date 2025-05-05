const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

    let users = [
      {
        user_uuid: "29b18008-b3ae-45eb-8423-36141958736e",
        first_name: "Contractor",
        last_name: "1",
        email_address: "contractor1@gmail.com",
        password: await bcrypt.hash("Contractor@123", saltRounds),
        phone_no: "1234567891",
        is_contractor: true,
        is_customer: false,
        is_verified: true,
        is_guided: false,
        status: "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_uuid: uuidv4(),
        first_name: "Contractor",
        last_name: "2",
        email_address: "contractor2@gmail.com",
        password: await bcrypt.hash("Contractor@123", saltRounds),
        phone_no: "1234567892",
        is_contractor: true,
        is_customer: false,
        is_verified: true,
        is_guided: false,
        status: "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_uuid: uuidv4(),
        first_name: "Customer",
        last_name: "1",
        email_address: "customer1@gmail.com",
        password: await bcrypt.hash("Customer@123", saltRounds),
        phone_no: "1234567893",
        is_customer: true,
        is_contractor: false,
        is_verified: true,
        is_guided: false,
        status: "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_uuid: uuidv4(),
        first_name: "Customer",
        last_name: "2",
        email_address: "customer2@gmail.com",
        password: await bcrypt.hash("Customer@123", saltRounds),
        phone_no: "1234567894",
        is_customer: true,
        is_contractor: false,
        is_verified: true,
        is_guided: false,
        status: "Active",
        profile_url: "",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert("users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE users RESTART IDENTITY CASCADE"
    );
  }
};
