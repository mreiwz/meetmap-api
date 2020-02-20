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
