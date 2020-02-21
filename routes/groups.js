const express = require('express');
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupsInRadius,
  groupPhotoUpload
} = require('../controllers/groups');

const Group = require('../models/Group');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers to redirect
const meetupRouter = require('./meetups');

const router = express.Router();

// Bring in protect and autorize from auth middleware in order to protect routes
const {
  protect,
  authorize,
  checkExistenceOwnership
} = require('../middleware/auth');

// Reroute into other resource routers
router.use('/:groupId/meetups', meetupRouter);

//Routes
router.route('/radius/:zipcode/:distance').get(getGroupsInRadius);

router
  .route('/:id/photo')
  .put(
    protect,
    authorize('publisher', 'admin'),
    checkExistenceOwnership(Group),
    groupPhotoUpload
  );

router
  .route('/')
  .get(advancedResults(Group, 'meetups'), getGroups)
  .post(protect, authorize('publisher', 'admin'), createGroup);

router
  .route('/:id')
  .get(getGroup)
  .put(
    protect,
    authorize('publisher', 'admin'),
    checkExistenceOwnership(Group),
    updateGroup
  )
  .delete(
    protect,
    authorize('publisher', 'admin'),
    checkExistenceOwnership(Group),
    deleteGroup
  );

module.exports = router;
