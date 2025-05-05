class CustomError extends Error {
  constructor(message = "An error occurred", status = 400) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  serializeError() {
    return {
      success: false,
      status: this.status,
      data: null,
      errors: Array.isArray(this.message) ? this.message : [this.message]
    };
  }
}

class ErrorHandler extends CustomError {
  constructor(status, message) {
    super(message, status);
  }

  serializeError() {
    return {
      success: false,
      status: this.status,
      data: null,
      errors: [this.message]
    };
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized", status = 401) {
    super(message, status);
  }

  serializeError() {
    return {
      success: false,
      status: this.status,
      data: null,
      errors: [this.message],
      authorize: "Unauthorized"
    };
  }
}

class ValidationError extends CustomError {
  constructor(message = "Validation Error", status = 422) {
    super(message, status);
  }
}

class NotFoundError extends CustomError {
  constructor(message = "Not Found", status = 404) {
    super(message, status);
  }
}

class ServerError extends CustomError {
  constructor(message = "Server Error", status = 500) {
    super(message, status);
  }
}

module.exports = {
  CustomError,
  ErrorHandler,
  UnauthorizedError,
  ValidationError,
  ServerError,
  NotFoundError
};
