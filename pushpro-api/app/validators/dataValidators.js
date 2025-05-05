const validator = require("validator");
const moment = require("moment");
const { ValidationError } = require("../errors/CustomError");

const checkIsFloat = (value) => {
  if (!validator.isFloat(value, { min: 0 })) {
    throw new ValidationError("Invalid Float Value");
  }
};

const checkisValidDate = (date) => {
  const parsedDate = moment(date, "MM/DD/YYYY", true);
  if (!parsedDate.isValid()) {
    throw new ValidationError(
      "Invalid date format. Required format MM/DD/YYYY"
    );
  }
  if (!parsedDate.isAfter(moment())) {
    throw new ValidationError("Insurance Expired");
  }
  return true;
};

module.exports = { checkIsFloat, checkisValidDate };
