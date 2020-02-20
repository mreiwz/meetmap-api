const express = require('express');
const { register, login, getMe } = require('../controllers/auth');

const router = express.Router();

// Bring in protect from auth middleware in order to protect routes
const { protect } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);

module.exports = router;
