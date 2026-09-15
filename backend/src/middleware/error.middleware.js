const config = require('../config');
const { errorResponse } = require('../utils/response.util');

const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found - ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle PostgreSQL known error codes
  if (err.code === '23505') { // Unique constraint violation
    statusCode = 409;
    if (err.constraint && err.constraint.includes('email')) {
      message = 'An account with this email already exists.';
    } else if (err.constraint && err.constraint.includes('student_id')) {
      message = 'A student with this Student ID is already registered.';
    } else if (err.constraint && err.constraint.includes('group_members_user')) {
      message = 'This student is already a member of an active group.';
    } else if (err.constraint && err.constraint.includes('groups_name')) {
      message = 'A group with this name already exists.';
    } else if (err.constraint && err.constraint.includes('submissions_assignment_student')) {
      message = 'You have already confirmed submission for this assignment.';
    } else {
      message = 'A duplicate record conflict occurred.';
    }
  } else if (err.code === '23503') { // Foreign key violation
    statusCode = 400;
    message = 'Referenced record was not found.';
  } else if (
    err.code === '22P02' ||
    err.message?.includes('cannot cast type text to uuid') ||
    err.message?.includes('invalid input syntax for type uuid') ||
    err.data?.error?.includes('cannot cast type text to uuid')
  ) { // Invalid text representation / UUID format
    statusCode = 400;
    message = 'Invalid identifier format.';
  } else if (err.name === 'JsonWebTokenError') {

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
