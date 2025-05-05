const AdminDashboardService = require("../../../services/admin/dashboard");
const catchAsyncError = require("../../../helpers/catch-async-error");
const {
  CustomError,
  ServerError,
  ValidationError
} = require("../../../errors/CustomError");
const validator = require("validator");

const getTotalCustomers = catchAsyncError(async (req, res) => {
  try {
    const totalCustomers = await AdminDashboardService.getTotalCustomers();
    res.status(200).json({
      success: true,
      data: totalCustomers,
      message: "Total Customers fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Total Customers: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getTotalContractors = catchAsyncError(async (req, res) => {
  try {
    const totalContractors = await AdminDashboardService.getTotalContractors();
    res.status(200).json({
      success: true,
      data: totalContractors,
      message: "Total Contractors fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Total Contractors: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getTotalPayment = catchAsyncError(async (req, res) => {
  try {
    const paymentTotal = await AdminDashboardService.getPaymentTotals();
    res.status(200).json({
      success: true,
      data: paymentTotal,
      message: "Payment Total fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Payment Total: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getTotalInvoice = catchAsyncError(async (req, res) => {
  try {
    const invoiceTotal = await AdminDashboardService.getInvoiceTotals();
    res.status(200).json({
      success: true,
      data: invoiceTotal,
      message: "Invoice Total fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Invoice Total: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getTotalCustomers,
  getTotalContractors,
  getTotalPayment,
  getTotalInvoice
};
