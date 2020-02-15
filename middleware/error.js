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
    const message = `That name already exists`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(value => value.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || `There was a server error, try again`
  });
};

module.exports = errorHandler;
