const config = require('../config');
const { errorResponse } = require('../utils/response.util');

const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found - ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid identifier format: ${err.value}`;
  }
  // Handle MongoDB Duplicate Key Error (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || '';
    if (field === 'email') {
      message = 'An account with this email address already exists.';
    } else if (field === 'student_id') {
      message = 'A student with this Student ID is already registered.';
    } else if (field === 'user_id') {
      message = 'This student is already a member of an active group.';
    } else if (field === 'name') {
      message = 'A group with this name already exists. Please choose a different name.';
    } else if (field === 'assignment_id') {
      message = 'You have already confirmed submission for this assignment.';
    } else {
      message = 'A duplicate record conflict occurred.';
    }
  }
  // Handle Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    const errorDetails = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = errorDetails.map((e) => e.message).join(', ') || 'Validation error';
    errors = errorDetails;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // Only log unexpected server errors in development or logs
  if (statusCode === 500) {
    console.error('[UNHANDLED_ERROR]', err);
    if (config.nodeEnv === 'production') {
      message = 'An unexpected server error occurred. Please try again later.';
    }
  }

  return errorResponse(res, message, statusCode, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
