require("dotenv").config();
const { ValidationError, NotFoundError } = require("../../errors/CustomError");
const db = require("../../../models");
const { Op } = require("sequelize");

class AdminUserManagement {
  // static async getAdminUser() {
  //   const systemModule = await db.SystemModule.findAll();
  //   if(!systemModule || systemModule.length === 0) {
  //     throw new NotFoundError("System Modules Not Found");
  //   }
  //   return systemModule;
  // }
  static async getAllAdminUsers() {
    const adminUsers = await db.AdminUsers.findAll({
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email_address",
        "phone_no"
      ],
      order: [["createdAt", "DESC"]]
    });
    if (!adminUsers || adminUsers.length === 0)
      throw new NotFoundError("Admin Users Not Found");
    return adminUsers;
  }

  static async validatePassword(password) {
    const isValid = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      maxLength: 16
    });
    if (!isValid) {
      throw new ValidationError("Password is not strong enough");
    }
    return isValid;
  }

  static async hashPassword(password) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
    return await bcrypt.hash(password, saltRounds);
  }

  static async getSystemModules() {
    const systemModule = await db.SystemModule.findAll({
      where: {
        is_permissible: true,
        slug: {
          [db.Sequelize.Op.ne]: null
        }
      },
      order: [["createdAt", "DESC"]]
    });
    if (!systemModule || systemModule.length === 0)
      throw new NotFoundError("System Modules Not Found");
    return systemModule;
  }

  // static async assignPermissions(roleId, permissions) {
  //   const role = await db.admin_roles.findOne({ where: { id: roleId } });
  //   if (!role) throw new NotFoundError("Role Not Found");
  //   // await role.setPermissions(permissions);
  //   role.permissions = permissions;
  //   await role.save();
  //   return role;
  // }

  static async assignPermissions(roleId, permissions) {
    // Remove keys with empty arrays
    const filteredPermissions = Object.fromEntries(
      Object.entries(permissions).filter(([_, perms]) => perms.length > 0)
    );

    const role = await db.admin_roles.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundError("Role Not Found");

    // Update the permissions directly
    role.permissions = filteredPermissions; // or however your model handles permissions

    await role.save();

    return role;
  }
}

module.exports = AdminUserManagement;
