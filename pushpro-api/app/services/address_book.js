const db = require("../../models");
const APIFeature = require("../../utils/APIFeature");
const { NotFoundError, ValidationError } = require("../errors/CustomError");
const { Op } = require("sequelize");

class AddressBookServices {
  static async getAllAddress(condition) {
    const address = await db.AddressBook.findAll({
      where: condition,
      attributes: [
        "id",
        "address_line_1",
        "address_line_2",
        "city",
        "state",
        "country",
        "zip_code",
        "status"
      ]
    });
    return address;
  }

  static async getOneAddress(id) {
    const address = await db.AddressBook.findOne({ where: { id: id } });
    return address;
  }

  static async createAddress(payload, id) {
    const address = await db.AddressBook.create({
      ...payload,
      user_id: id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return address;
  }

  static async updateAddress(id, data) {
    const address = await db.AddressBook.update(data, {
      where: { id: id }
    });
    return address;
  }

  static async deleteAddress(id) {
    const address = await db.AddressBook.destroy({
      where: { id: id }
    });
    return address;
  }
}

module.exports = AddressBookServices;
