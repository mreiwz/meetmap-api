const ErrorResponose = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Development mode: log to console
  console.error(err.stack.red);

  // Mongoose bad ObjectId, for a general resource, not just groups
  if (err.name === 'CastError') {
    const message = `Resource not found with id:${err.value}`;
    error = new ErrorResponose(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || `There was a server error, try again`
  });
};

module.exports = errorHandler;
