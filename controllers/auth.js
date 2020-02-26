const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @desc      Register user
// @route     POST /api/V1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role
  });
  sendTokenResponse(user, 201, res);
});

// @desc      Login user
// @route     POST /api/V1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse(`Please enter an email and password`, 400));
  }
  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse(`Invalid credentials, try again`, 401));
  }
  // Check if password matches
  const isMatch = await user.matchPassword(password.toString());
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials, try again`, 401));
  }
  sendTokenResponse(user, 200, res);
});

// @desc      Get currently logged in user
// @route     GET /api/V1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: req.user });
});

// @desc      Forgot password
// @route     POST /api/V1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // ? Should this information be shared?
    return next(
      new ErrorResponse(
        `There is no user registered with that email address`,
        404
      )
    );
  }
  // Get password reset token
  const resetToken = user.getPasswordResetToken();
  console.log(resetToken);
  // Save to database
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) requested the reset of your password. Please make a PUT request to ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(`Email could not be sent`, 500));
  }

  res.status(200).json({ success: true, data: `Email sent` });
});

// @desc      Reset password
// @route     PUT /api/V1/auth/resetpassword/:resetToken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  // Find user by hashed reset token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Response: log the user in
  sendTokenResponse(user, 200, res);
});

// * Function - create token, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwt();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};
