const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Development mode: log to console
  console.error(err.stack.red);

  // Mongoose bad ObjectId, for a general resource, not just groups
  if (err.name === 'CastError') {
    const message = `Resource not found with id:${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `That name or email already exists`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(value => value.message);
    error = new ErrorResponse(message, 400);
  }

  // SyntaxError
  if (err.name === 'SyntaxError') {
    const message = `Bad request, check your inputs and try again`;
    error = new ErrorResponse(message, 400);
  }

  // Authentication JsonWebTokenError
  if (err.name === 'JsonWebTokenError') {
    const message = `Unauthorized to access this resource, check your credentials and try again`;
    error = new ErrorResponse(message, 401);
  }

  // Authentication TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    const message = `Session expired, please log in again`;
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || `There was a server error, try again`
  });
};

module.exports = errorHandler;
