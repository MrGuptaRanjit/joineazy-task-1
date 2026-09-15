const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response.util');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return errorResponse(
      res,
      'Validation failed. Please check the input fields.',
      400,
      formattedErrors
    );
  };
};

module.exports = validate;
