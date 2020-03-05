const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Bring in protect from auth middleware in order to protect routes
const { protect, authorize } = require('../middleware/auth');

// Instead of adding on each route, add to all
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
