const UserServices = require("../../../services/user");
const catchAsyncError = require("../../../helpers/catch-async-error");
const { CustomError, ServerError, ValidationError } = require("../../../errors/CustomError");
const validator = require("validator");

const getCustomers = catchAsyncError(async (req, res) => {
  try {
  const customers = await UserServices.getAllCustomers();
  const data = customers.map((customer) => {
    return {
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email_address: customer.email_address,
      phone_no: customer.phone_no,
      status: customer.status
    };
  })
    res.status(200).json({
      success: true,
      data: data,
      message: "Customers fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new CustomError(
      `Cannot Get Customers: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getCustomerById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await UserServices.getCustomerById({ id: id, is_customer: true });
    if (!customer) {
      throw new ValidationError("Customer Not Found");
    }
    res.status(200).json({
      success: true,
      data: customer,
      message: "Customer fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Customer: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});
const deleteCustomerById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await UserServices.deleteCustomer({where: { id: id, is_customer: true }});
    if (!customer) {
      throw new ValidationError("Customer Not Found");
    }
    res.status(200).json({
      success: true,
      data: customer,
      message: "Customer deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Delete Customer: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getCustomers,
  getCustomerById,
  deleteCustomerById
}