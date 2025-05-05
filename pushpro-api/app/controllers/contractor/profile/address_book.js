const AddressBookServices = require("../../../services/address_book");
const catchAsyncError = require("../../../helpers/catch-async-error");
const {
  ValidationError,
  UnauthorizedError,
  ServerError,
  ErrorHandler
} = require("../../../errors/CustomError");
const validator = require("validator");
const UserServices = require("../../../services/user");

const getMyAddressBook = catchAsyncError(async (req, res) => {
  try {
    const id = req.user.id;
    const addressBook = await AddressBookServices.getAllAddress({
      user_id: id
    });
    res.status(200).json({
      success: true,
      data: addressBook || [],
      message: "Address Book fetched successfully",
      errors: []
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const createAddress = catchAsyncError(async (req, res) => {
  try {
    const id = req.user.id;
    const payload = req.body;
    const user = await UserServices.getCustomerById({ id: id });
    if (!user) throw new ValidationError("User Not Found");
    const address = await AddressBookServices.createAddress(payload, id);
    res.status(200).json({
      success: true,
      data: address?.dataValues || [],
      message: "Address Book Created Successfully",
      errors: []
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const updateAddress = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    const address = await AddressBookServices.updateAddress(id, payload);
    res.status(200).json({
      success: true,
      data: address || [],
      message: "Address Book Updated Successfully",
      errors: []
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

const deleteAddress = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const address = await AddressBookServices.delete(id);
    res.status(200).json({
      success: true,
      data: address || [],
      message: "Address Book Deleted Successfully",
      errors: []
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.status).json(err.serializeError());
    } else {
      const serverError = new ServerError(err.message);
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
});

module.exports = {
  getMyAddressBook,
  createAddress,
  updateAddress,
  deleteAddress
};
