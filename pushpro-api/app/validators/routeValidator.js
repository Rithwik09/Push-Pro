const { validationResult, checkSchema } = require("express-validator");
const { ValidationError } = require("../errors/CustomError");

const routeError = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array()?.map((err) => err?.msg);
    return next(new ValidationError(errorArray));
  }
  next();
};

const saveOriginalRequestData = (req, res, next) => {
  res.locals.originalBody = { ...req.body };
  res.locals.originalParams = { ...req.params };
  next();
};

module.exports.validateRouteHandler = (schema) => {
  return [saveOriginalRequestData, checkSchema(schema), routeError];
};
