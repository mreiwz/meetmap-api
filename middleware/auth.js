const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  // Check headers and get token from there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // TODO: cookies functionality
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Check that token exists, either sent in header or in a cookie
  if (!token) {
    return next(
      new ErrorResponse(
        `Unauthorized to access this resource, check your credentials and try again`,
        401
      )
    );
  }

  // If the token exists, verify it
  // * JsonWebTokenError case added to async/error handling middleware
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

// Grant access to specific roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new ErrorResponse(
        `Forbidden: user role ${req.user.role} unauthorized to access this resource`,
        403
      )
    );
  }
  next();
};

// Check existence and ownership of resource
exports.checkExistenceOwnership = model =>
  asyncHandler(async (req, res, next) => {
    let resource = await model.findById(req.params.id);
    // Check that resource exists
    if (!resource) {
      return next(
        new ErrorResponse(`Resource not found with id:${req.params.id}`, 404)
      );
    }
    // If resource exists, make sure user owns the resource, unless they're admin
    if (req.user.role !== 'admin' && resource.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `You don't have permission to modify that resource`,
          401
        )
      );
    }
    next();
  });
