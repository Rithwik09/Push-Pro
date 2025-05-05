// middlewares/errorHandlerMiddleware.js
const { CustomError } = require("../errors/CustomError");

function errorHandler(err, req, res, next) {
  // Ensure status and message have default values
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Check if it's an instance of our CustomError class
  if (err instanceof CustomError) {
    return res.status(err.status).json(err.serializeError());
  }

  // Handle Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(422).json({
      success: false,
      data: null,
      errors: [err.errors && err.errors[0]?.message]
    });
  }

  // Generic error handler
  return res.status(status).json({
    success: false,
    data: null,
    errors: [message]
  });
}

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

module.exports = {
  errorHandler,
  notFound
};
