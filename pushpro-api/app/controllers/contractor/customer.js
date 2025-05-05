const UserServices = require("../../services/user");
const EmailServices = require("../../services/email");
const AddressBookServices = require("../../services/address_book");
const {
  ServerError,
  ValidationError,
  ErrorHandler
} = require("../../errors/CustomError");
const catchAsyncError = require("../../helpers/catch-async-error");

const generatePassword = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "124678";
  let password = "";
  for (let i = 0; i < 6; i++) {
    password += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 2; i++) {
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};

const getCustomerByName = catchAsyncError(async (req, res) => {
  try {
    const { name } = req.query;
    const userId = req.user.id;

    let customers;

    if (!name || name.trim() === "") {
      // return new ValidationError("Please provide a valid customer name.");
      customers = await UserServices.getDefaultCustomers(userId);
    } else {
      customers = await UserServices.searchCustomersByName(name, userId);
    }
    const filteredCustomers = customers.filter(
      (customer) => customer.is_customer === true
    );
    if (filteredCustomers.length === 0) {
      return res.status(205).json({
        success: false,
        data: [],
        message: "No customers found with the provided name."
      });
    }
    const customerData = filteredCustomers.slice(0, 6).map((customer) => ({
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email_address: customer.email_address,
      profile_url: customer.profile_url
    }));
    return res.status(200).json({
      success: true,
      data: customerData,
      message: "Customers Fetched Successfully",
      errors: []
    });
  } catch (error) {
    console.error("Error Fetching Customers:", error);
    const serverError = new ServerError(
      `Cannot Get Customer Name: ${error.message}`
    );
    return res.status(serverError.status).json(serverError.serializeError());
  }
});

const addCustomerByContractor = catchAsyncError(async (req, res) => {
  const user_uuid = req.body.user_id;
  const { first_name, last_name, email_address, phone_no } = req.body;
  try {
    const contractor = await UserServices.getContractor({ user_uuid });
    if (!contractor) {
      throw new NotFoundError("Contractor not found: Invalid UUID");
    }
    const userExists = await UserServices.getCustomer({ email_address });
    if (userExists?.is_contractor) {  
      throw new ErrorHandler(
        415,
        "Email Already Exists as a Contractor, Try Another Email Address."
      );
    }
    if (userExists?.is_customer) {
      const contractorCustomerRelation =
        await UserServices.contractorCustomerRelation(
          userExists.id,
          contractor.id
        );
      if (!contractorCustomerRelation) {
        const newRelation = await UserServices.contractorCustomerRelation(
          userExists.id,
          contractor.id
        );
        if (!newRelation) {
          throw new ServerError(
            "Cannot Establish Customer and Contractor Relation. Please Try Again."
          );
        }
      } else {
        const emailStatus = await EmailServices.newCustomerRelation(
          userExists?.email_address,
          contractor?.id
        );
        if (!emailStatus) {
          console.error("Error Sending Customer Account Activation Email");
        }
        const responseData1 = {
          id: userExists?.id,
          first_name: userExists?.first_name,
          last_name: userExists?.last_name
        };
        return res.status(200).json({
          success: true,
          data: responseData1,
          message: "Thanks for Registering.",
          errors: []
        });
      }
    } else {
      const password = generatePassword();
      const hashedPassword = await UserServices.hashPassword(password);
      const newUser = await UserServices.createCustomer({
        first_name,
        last_name,
        email_address,
        password: hashedPassword,
        phone_no
      });
      const contractorCustomer = await UserServices.contractorCustomerRelation(
        newUser.id,
        contractor.id
      );
      if (!contractorCustomer) {
        throw new ServerError(
          "Cannot Establish Customer and Contractor Relation. Please Try Again."
        );
      }
      const contractorName = `${contractor.first_name} ${contractor.last_name}`;
      await contractorCustomer.save();
      const emailStatus = await EmailServices.sendCustomerPasswordDetails(
        email_address,
        password,
        contractorName
      );
      if (!emailStatus) {
        console.error("Error Sending Customer Account Activation Email");
      }
      await newUser.save();
      const responseData = {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      };
      return res.status(200).json({
        success: true,
        data: responseData,
        message:
          "Thanks for Registering. Please check your email box (along with Spam box) for Verification Link.",
        errors: []
      });
    }
  } catch (err) {
    if (err instanceof ErrorHandler) {
      return res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      return res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const getAllCustomers = catchAsyncError(async (req, res) => {
  const userId = req.user.id;
  const { pageSize, currentPage } = req.body;

  const limit = parseInt(pageSize);
  const page = parseInt(currentPage);
  const offset = (page - 1) * limit;

  // Fetch customers with pagination
  const { customerData, totalCustomers } = await UserServices.getContractorCustomers(userId, limit, offset);

  if (!customerData || customerData.length === 0) {
    throw new NotFoundError("No customers found for this contractor.");
  }

  return res.status(200).json({
    success: true,
    data: customerData,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalCustomers / limit),
      totalItems: totalCustomers
    }
  });
});

const customerAddress = catchAsyncError(async (req, res) => {
  try {
    const custId = req.params.id;
    const userId = req.user.id;
    const customerDetails = await UserServices.getCustomerDetails(
      custId,
      userId
    );
    if (!customerDetails) {
      throw new NotFoundError("Customer not found");
    }
    const customerAddress = await AddressBookServices.getAllAddress({
      user_id: custId
    });
    res.status(200).json({
      success: true,
      data: customerDetails,
      customerAddress: customerAddress
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    const serverError = new ServerError(
      `Cannot Fetch Customers: ${error.message}`
    );
    return res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getCustomerByName,
  addCustomerByContractor,
  customerAddress,
  getAllCustomers,
  getCustomerByName,
  addCustomerByContractor
};
