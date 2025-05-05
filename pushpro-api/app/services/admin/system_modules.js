require("dotenv").config();
const { NotFoundError } = require("../../errors/CustomError");
const db = require("../../../models");

class AdminSystemModules {
  static async getAdminSystemModules() {
    const systemModule = await db.SystemModule.findAll({
      where: { parent_module_id: null },
      include: [
        {
          model: db.SystemModule,
          as: "sub_modules",
          required: false
        }
      ],
      order: [
        ["display_order", "ASC"],
        [{ model: db.SystemModule, as: "sub_modules" }, "display_order", "ASC"]
      ]
    });
    if (!systemModule || systemModule.length === 0) {
      throw new NotFoundError("System Modules Not Found");
    }
    return systemModule;
  }
}

module.exports = AdminSystemModules;
