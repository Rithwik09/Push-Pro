const db = require("../../../models");
const { NotFoundError } = require("../../errors/CustomError");

class AdminDashboardService {
  static async getTotalCustomers() {
    try {
      const data = await db.Users.count({ where: { is_customer: true } });
      return data;
    } catch (error) {
      throw new NotFoundError("No customers found");
    }
  }

  static async getTotalContractors() {
    try {
      const data = await db.Users.count({ where: { is_contractor: true } });
      return data;
    } catch (error) {
      throw new NotFoundError("No contractors found");
    }
  }

  static async getPaymentTotals() {
    try {
      const data = await db.Estimations.sum("total");
      if (data === null) {
        throw new NotFoundError("No estimations found");
      }
      return data;
    } catch (error) {
      throw new NotFoundError("No estimations found");
    }
  }

  static async getInvoiceTotals() {
    try {
      const data = await db.Estimations.count();
      return data;
    } catch (error) {
      throw new NotFoundError("No estimations found");
    }
  }
}

module.exports = AdminDashboardService;
