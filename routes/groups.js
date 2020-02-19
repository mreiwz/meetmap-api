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

// Reroute into other resource routers
router.use('/:groupId/meetups', meetupRouter);

router.route('/radius/:zipcode/:distance').get(getGroupsInRadius);

router.route('/:id/photo').put(groupPhotoUpload);

router
  .route('/')
  .get(advancedResults(Group, 'meetups'), getGroups)
  .post(createGroup);

router
  .route('/:id')
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

module.exports = router;
