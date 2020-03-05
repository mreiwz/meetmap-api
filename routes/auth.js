const express = require('express');
const {
  register,
  login,
  getMe,
  updateInfo,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');

const router = express.Router();

// Bring in protect from auth middleware in order to protect routes
const { protect } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);
router.route('/updateinfo').put(protect, updateInfo);
router.route('/updatepassword').put(protect, updatePassword);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resetToken').put(resetPassword);

module.exports = router;
