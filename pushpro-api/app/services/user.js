require("dotenv").config();
const bcrypt = require("bcrypt");
const validator = require("validator");
const db = require("../../models");
const { v4: uuidv4 } = require("uuid");
const APIFeature = require("../../utils/APIFeature");
const { NotFoundError, ValidationError } = require("../errors/CustomError");
const { where } = require("sequelize");

class UserServices {
  static async getAllUsers({ pageNo, limit, search, condition }) {
    const users = new APIFeature({ query: db.Users, limit });
    if (search) {
      users.search({
        user_uuid: search,
        email_address: search,
        phone_no: search
      });
    }
    if (condition) {
      users.whereAnd(condition);
    }
    users.projection([
      "user_uuid",
      "first_name",
      "last_name",
      "email_address",
      "phone_no"
    ]);
    users.orderBy([["createdAt", "DESC"]]);
    users.paginate(pageNo || 1);
    const result = await users.exec();
    return {
      users: result?.rows,
      totalPage: users.getTotalPages()
    };
  }

  static async searchContractorsByName(name, associatedContractorIds) {
    const nameParts = name.split(" ");
    const whereConditions = nameParts.map((part) => ({
      [db.Sequelize.Op.or]: [
        { first_name: { [db.Sequelize.Op.like]: `%${part}%` } },
        { last_name: { [db.Sequelize.Op.like]: `%${part}%` } }
      ]
    }));
    const contractors = await db.Users.findAll({
      where: {
        id: associatedContractorIds,
        [db.Sequelize.Op.and]: whereConditions
      },
      attributes: [
        "id",
        "user_uuid",
        "first_name",
        "last_name",
        "email_address",
        "phone_no"
      ],
      order: [["id", "DESC"]]
    });
    return contractors;
  }

  static async searchCustomersByName(name, contractor_id) {
    const nameParts = name.split(" ");
    const whereConditions = nameParts.map((part) => ({
      [db.Sequelize.Op.or]: [
        { first_name: { [db.Sequelize.Op.iLike]: `%${part}%` } },
        { last_name: { [db.Sequelize.Op.iLike]: `%${part}%` } }
      ]
    }));

    const customers = await db.Users.findAll({
      where: {
        [db.Sequelize.Op.and]: whereConditions
      },
      attributes: [
        "id",
        "user_uuid",
        "first_name",
        "last_name",
        "email_address",
        "phone_no",
        "is_customer",
        "profile_url"
      ],
      order: [["id", "DESC"]]
    });

    const relations = await db.CustomersContractors.findAll({
      where: {
        contractor_id: contractor_id,
        customer_id: customers.map((c) => c.id)
      },
      attributes: ["customer_id"]
    });

    const relatedCustomerIds = relations.map(
      (relation) => relation.customer_id
    );

    const filteredCustomers = customers.filter((customer) =>
      relatedCustomerIds.includes(customer.id)
    );

    return filteredCustomers;
  }

  static async getDefaultCustomers(contractor_id) {
    const relations = await db.CustomersContractors.findAll({
      where: {
        contractor_id: contractor_id
      },
      attributes: ["customer_id"]
    });
  
    const relatedCustomerIds = relations.map(
      (relation) => relation.customer_id
    );

    const customers = await db.Users.findAll({
      where: {
        id: {
          [db.Sequelize.Op.in]: relatedCustomerIds
        }
      },
      attributes: [
        "id",
        "user_uuid",
        "first_name",
        "last_name",
        "email_address",
        "phone_no",
        "is_customer",
        "profile_url"
      ],
      order: [["id", "DESC"]] 
    });  
    return customers;
  }
  

  static async getUser(query) {
    const user = await db.Users.findOne({ where: query });
    if (!user) return false;
    return user;
  }

  static async getCustomer(query) {
    const customer = await db.Users.findOne({
      where: query,
      attributes: [
        "id",
        "user_uuid",
        "first_name",
        "last_name",
        "email_address",
        "password",
        "phone_no",
        "notification_email",
        "notification_sms",
        "is_customer",
        "is_contractor",
        "is_verified",
        "is_guided",
        "status",
        "profile_url"
      ]
    });
    return customer;
  }

  static async getCustomerById(query) {
    const customer = await db.Users.findOne({
      where: query,
      attributes: [
        "id",
        "user_uuid",
        "first_name",
        "last_name",
        "email_address",
        "phone_no",
        "notification_email",
        "notification_sms",
        "is_customer",
        "is_contractor",
        "is_verified"
      ]
    });
    return customer;
  }

  static async getContractor(query) {
    const contractor = await db.Users.findOne({
      where: {
        ...query,
        is_contractor: true
      }
    });
    return contractor;
  }

  static async getContractorById(query) {
    const contractor = await db.Users.findOne({
      where: query,
      attributes: [
        "id",
        "user_uuid",
        "first_name",
        "last_name",
        "email_address",
        "phone_no",
        "profile_url",
        "notification_email",
        "notification_sms"
      ]
    });
    return contractor;
  }

  static async getAllContractors() {
    const data = await db.Users.findAll({
      where: { is_contractor: true },
      order: [["id", "DESC"]]
    });
    return data;
  }

  static async getAllCustomers() {
    const data = await db.Users.findAll({
      where: { is_customer: true },
      order: [["id", "DESC"]]
    });
    return data;
  }

  static async getContractorCustomers(contractorId, limit, offset) {
    // Get total count of customers for pagination
    const totalCustomers = await db.CustomersContractors.count({
      where: { contractor_id: contractorId }
    });
  
    // Fetch paginated customers
    const customers = await db.CustomersContractors.findAll({
      where: { contractor_id: contractorId },
      include: [
        {
          model: db.Users,
          as: "cus2", // Alias from the association for customer
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email_address",
            "profile_url",
            "phone_no"
          ]
        }
      ],
      limit,  
      offset  
    });

    const customerData = customers.map((record) => record.cus2);
  
    return { customerData, totalCustomers };
  }
  

  static async getCustomerDetails(customerid, contractorid) {
    const data = await db.CustomersContractors.findOne({
      where: {
        customer_id: customerid,
        contractor_id: contractorid
      },
      include: [
        {
          model: db.Users,
          as: "cus2",
          attributes: ["first_name", "last_name", "email_address", "phone_no"],
          where: { is_customer: true },
          required: true
        }
      ]
    });

    if (data) {
      return data;
    } else {
      throw new NotFoundError("Contractor Customer Relation Not Found");
    }
  }
  static async contractorCustomerRelation(customerid, contractorid) {
    const data = await db.CustomersContractors.create({
      customer_id: customerid,
      contractor_id: contractorid,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await data.save();
    return data;
  }

  static async contractorSubContractorRelation(userid, contractorid) {
    const data = await db.ContractorSubContractors.create({
      user_id: userid,
      contractor_id: contractorid,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await data.save();
    return data;
  }

  static async findrelationByCustomerId(customerId) {
    const data = await db.CustomersContractors.findOne({
      where: { customer_id: customerId }
    });
    if (!data)
      throw new NotFoundError("Contractor Customer Relation Not Found");
    return data;
  }

  static async findAllRelationsByContractorId(id) {
    const data = await db.CustomersContractors.findAll({
      where: { contractor_id: id },
      order: [["id", "DESC"]]
    });
    if (!data) return false;
    return data;
  }

  // static async findAllRelationsByCustomerId(id) {
  //   const data = await db.CustomersContractors.findAll({
  //     where: { customer_id: id },
  //     order: [["id", "DESC"]]
  //   });
  //   if (!data) return false;
  //   return data;
  // }

  static async findContractorSubContractorRelations(query) {
    const data = await db.ContractorSubContractors.findAll({
      where: query,
      order: [["id", "DESC"]]
    });
    if (!data) return false;
    return data;
  }

  static async findSubContractorByContractorId(contractorId) {
    const subContractors = await db.ContractorSubContractors.findAll({
      where: { contractor_id: contractorId },
      order: [["id", "DESC"]]
    });
    const contractors = await db.ContractorSubContractors.findAll({
      where: { user_id: contractorId },
      order: [["id", "DESC"]]
    });
    if (subContractors && subContractors.length > 0) {
      return subContractors;
    } else if (contractors && contractors.length > 0) {
      return contractors;
    } else {
      return [];
    }
  }

  static async checkRelation(customerid, contractorid) {
    const data = await db.CustomersContractors.findOne({
      where: { customer_id: customerid, contractor_id: contractorid }
    });
    if (data) return true;
    return false;
  }

  static async checkRelationContractorSubContractor(customerid, contractorid) {
    const data = await db.ContractorSubContractors.findOne({
      where: { user_id: customerid, contractor_id: contractorid }
    });
    if (data) return true;
    return false;
  }

  static async getCompanyDetails(id, excludeFields = []) {
    const data = await db.CompanyDetails.findOne({ where: { user_id: id } });
    if (!data) return null;
    const dataObj = data.toJSON();
    excludeFields.forEach((field) => {
      delete dataObj[field];
    });
    return dataObj;
  }

  static async getCompanyDetailsById(id) {
    const data = await db.CompanyDetails.findOne({ where: { user_id: id } });
    if (!data) return [];
    return dataObj;
  }

  static async setSocialLinks(userId, socialLinksData) {
    socialLinksData.user_id = userId;
    const links = await db.UserSocialLinks.create(socialLinksData);
    await links.save();
    return links;
  }

  static async updateSocialLinks(userId, socialLinksData) {
    const [updatedRowCount] = await db.UserSocialLinks.update(socialLinksData, {
      where: { user_id: userId }
    });
    if (updatedRowCount === 0) {
      throw new Error("Failed to Update Social Links");
    }
    return await this.getSocialLinks(userId);
  }

  static async createUser(payload) {
    const user = await db.Users.create(payload);
    await user.save();
    return user;
  }

  static async updateUser(payload, condition) {
    const user = await db.Users.update(
      payload,
      { where: condition },
      {
        updatedAt: new Date()
      }
    );
    return user;
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
  static async comparePasswords(inputPassword, hashedPassword) {
    const isValid = await bcrypt.compare(inputPassword, hashedPassword);
    if (!isValid) throw new ValidationError("Invalid Current Password");
    return isValid;
  }

  static async createCustomer(payload) {
    const customer = await this.createUser({
      ...payload,
      user_uuid: uuidv4().toString(),
      is_customer: true,
      is_contractor: false,
      is_verified: false,
      verification_code: uuidv4().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return customer;
  }

  static async deleteCustomer(query) {
    const customer = await db.Users.destroy(query);
    if (!customer) {
      throw new NotFoundError("Contractor Not Found");
    }
    return customer;
  }

  static async createContractor(payload) {
    const contractor = await this.createUser({
      ...payload,
      user_uuid: uuidv4().toString(),
      is_customer: false,
      is_contractor: true,
      is_verified: false,
      verification_code: uuidv4().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return contractor;
  }

  static async deleteContractor(query) {
    const contrator = await db.Users.destroy(query);
    if (!contrator) {
      throw new NotFoundError("Contractor Not Found");
    }
    return contrator;
  }

  static async getSocialLinks(userId, excludeFields = []) {
    const data = await db.UserSocialLinks.findOne({
      where: { user_id: userId }
    });
    if (!data) return null;
    const dataObj = data.toJSON();
    excludeFields.forEach((field) => {
      delete dataObj[field];
    });
    return dataObj;
  }
  static async getInsuranceById(id) {
    const data = await db.ContractorInsurances.findAll({
      where: { user_id: id },
      order: [["id", "DESC"]]
    });
    if (!data) return null;
    return data;
  }

  static async getLicenseById(id) {
    const data = await db.ContractorLicenses.findAll({
      where: { user_id: id },
      order: [["id", "DESC"]],
      include: [
        {
          model: db.Services,
          as: "service3"
        }
      ]
    });
    if (!data) return null;
    if (!data) return null;
    return data;
  }

  static async getCertificateById(id, excludeFields = []) {
    const data = await db.ContractorCertificates.findAll({
      where: { user_id: id },
      order: [["createdAt", "DESC"]]
    });
    if (!data) return null;
    return data;
  }

  static async getContractorBrandingById(id) {
    const data = await db.ContractorBrandings.findOne({
      where: { user_id: id }
    });
    if (!data) return null;
    return data;
  }
}

module.exports = UserServices;
