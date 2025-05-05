require("dotenv").config();
const bcrypt = require("bcrypt");
const validator = require("validator");
const db = require("../../../models");
const APIFeature = require("../../../utils/APIFeature");
const { NotFoundError, ValidationError } = require("../../errors/CustomError");
const { Op } = require("sequelize");

class AdminUserServices {
  static async getAdminUser(query) {
    const adminUser = await db.AdminUsers.findOne({ where: query });
    return adminUser;
  }

  static async getAdminUserById(id) {
    const adminUser = await db.AdminUsers.findOne({
      where: { id },
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email_address",
        "phone_no",
        "status",
        "role_id"
      ],
      include: [
        {
          model: db.admin_roles,
          as: "role",
          attributes: ["id", "name", "permissions"]
        }
      ]
    });
    if (!adminUser) throw new NotFoundError("Admin User Not Found");
    return adminUser;
  }

  static async getAllAdminUsers() {
    const adminUsers = await db.AdminUsers.findAll({
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email_address",
        "phone_no",
        "status"
      ],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.admin_roles,
          as: "role",
          attributes: ["id", "name"]
        }
      ]
    });
    if (!adminUsers || adminUsers.length === 0)
      throw new NotFoundError("Admin Users Not Found");
    return adminUsers;
  }

  static async updateAdminUserProfile(payload, condition) {
    const adminUser = await db.AdminUsers.update(
      payload,
      { where: condition },
      {
        updatedAt: new Date()
      }
    );
    // if(!adminUser) throw new NotFoundError("Admin User Not Found");
    return adminUser;
  }

  static async updateAdminUser(id, payload) {
    let adminUser = await this.getAdminUserById(id);
    if (!adminUser) throw new NotFoundError("Admin User not found");
    adminUser = await db.AdminUsers.update(payload, {
      where: { id: id }
    });
    if (adminUser === 0) {
      throw new NotFoundError("Admin User Updation Failed");
    }
    adminUser = await this.getAdminUserById(id);
    await adminUser.save();
    return adminUser;
  }

  static async deleteAdminUser(id) {
    const adminUser = await db.AdminUsers.destroy({ where: { id } });
    if (!adminUser) throw new NotFoundError("Admin User Not Found");
    return adminUser;
  }

  static async updateRole(id, payload) {
    let role = await this.getRoleById(id);
    if (!role) throw new NotFoundError("Role not found");
    role = await db.admin_roles.update(payload, {
      where: { id: id }
    });
    if (role === 0) {
      throw new NotFoundError("Role Updation Failed");
    }
    role = await this.getRoleById(id);
    await role.save();
    return role;
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

  // static async updateAdmin(payload, condition) {
  //   const admin = await db.AdminUsers.update(
  //     payload,
  //     { where: condition },
  //     {
  //       updatedAt: new Date()
  //     }
  //   );
  //   return admin;
  // }

  static async hashPassword(password) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePasswords(inputPassword, hashedPassword) {
    const isValid = await bcrypt.compare(inputPassword, hashedPassword);
    if (!isValid) throw new ValidationError("Invalid Current Password");
    return isValid;
  }

  static async createAdminUser(payload) {
    const adminUser = await db.AdminUsers.create(payload);
    if (!adminUser) throw new ServerError("Cannot Add Admin User");
    await adminUser.save();
    return adminUser;
  }

  static async createRole(payload) {
    const role = await db.admin_roles.create(payload);
    if (!role) throw new ServerError("Cannot Add Role");
    await role.save();
    return role;
  }

  static async getAllRoles() {
    const roles = await db.admin_roles.findAll({
      attributes: ["id", "name", "status", "permissions"],
      order: [["createdAt", "DESC"]]
    });
    if (!roles || roles.length === 0)
      throw new NotFoundError("Roles Not Found");
    const filteredRoles = roles.filter((role) => role.name !== "Super Admin");
    return filteredRoles;
  }

  static async getRoleById(id) {
    const role = await db.admin_roles.findOne({ where: { id } });
    if (!role) throw new NotFoundError("Role Not Found");
    return role;
  }

  static async deleteRole(id) {
    const role = await db.admin_roles.destroy({ where: { id } });
    if (!role) throw new NotFoundError("Role Not Found");
    return role;
  }

  // static async getAllProjects({ pageNo, limit, search, condition }) {
  //   const projects = new APIFeature({
  //     query: db.Projects,
  //     limit
  //   });

  //   if (search) {
  //     projects.search({
  //       project_uuid: search,
  //       title: search,
  //       description: search
  //     });
  //   }
  //   if (condition) {
  //     projects.whereAnd(condition);
  //   }

  //   projects.projection([
  //     "id",
  //     "project_uuid",
  //     "customer_id",
  //     "contractor_id",
  //     "title",
  //     "description",
  //     "address_line_1",
  //     "address_line_2",
  //     "city",
  //     "state",
  //     "zip_code",
  //     "date_preference",
  //     "start_date",
  //     "end_date",
  //     "budget_preference",
  //     "budget_min",
  //     "budget_max",
  //     "project_type",
  //     "project_category",
  //     "status_id",
  //     "createdAt",
  //     "updatedAt"
  //   ]);

  //   projects.paginate(pageNo || 1);

  //   projects.query = projects.query.findAll({
  //     include: [
  //       {
  //         model: db.Users,
  //         as: "customer",
  //         attributes: ["first_name", "last_name"]
  //       },
  //       {
  //         model: db.Users,
  //         as: "contractor",
  //         attributes: ["first_name", "last_name"]
  //       }
  //     ]
  //   });

  //   const result = await projects.exec();
  //   return {
  //     projects: result?.rows,
  //     totalPage: projects.getTotalPages()
  //   };
  // }

  static async getAllProjects({ pageNo, limit, search, condition }) {
    const queryOptions = {
      attributes: [
        "id",
        "project_uuid",
        "customer_id",
        "contractor_id",
        "title",
        "description",
        "address_line_1",
        "address_line_2",
        "city",
        "state",
        "zip_code",
        "date_preference",
        "start_date",
        "end_date",
        "budget_preference",
        "budget_min",
        "budget_max",
        "project_type",
        "project_category",
        "status_id",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: db.Users,
          as: "customer",
          attributes: ["first_name", "last_name"]
        },
        {
          model: db.Users,
          as: "contractor",
          attributes: ["first_name", "last_name"]
        }
      ],
      where: {
        ...condition,
        ...(search && {
          title: {
            [Op.iLike]: `%${search}%`
          }
        })
      },
      limit: limit,
      offset: (pageNo - 1) * limit
    };

    const result = await db.Projects.findAndCountAll(queryOptions);

    return {
      projects: result.rows,
      totalPage: Math.ceil(result.count / limit)
    };
  }

  static async getProjectById(projectId) {
    if (!projectId || !validator.isNumeric(projectId.toString()))
      throw new ValidationError("Invalid Project ID");
    const project = await db.Projects.findOne({
      where: { id: projectId },
      include: [
        {
          model: db.Users,
          as: "customer",
          attributes: ["first_name", "last_name"]
        },
        {
          model: db.Users,
          as: "contractor",
          attributes: ["first_name", "last_name"]
        }
      ]
    });
    if (!project || project.length === 0)
      throw new NotFoundError("Project Not Found");
    return project.dataValues;
  }
}

module.exports = AdminUserServices;
