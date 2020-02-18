const express = require('express');
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupsInRadius
} = require('../controllers/groups');

// Include other resource routers to redirect
const meetupRouter = require('./meetups');

const router = express.Router();

// Reroute into other resource routers
router.use('/:groupId/meetups', meetupRouter);

router.route('/radius/:zipcode/:distance').get(getGroupsInRadius);

router
  .route('/')
  .get(getGroups)
  .post(createGroup);

router
  .route('/:id')
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

module.exports = router;
