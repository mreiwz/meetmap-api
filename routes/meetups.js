const express = require('express');
const {
  getMeetups,
  getMeetup,
  createMeetup,
  updateMeetup,
  deleteMeetup
} = require('../controllers/meetups');

const Meetup = require('../models/Meetup');
const Group = require('../models/Group');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Bring in protect and authorize from auth middleware in order to protect routes
const {
  protect,
  authorize,
  checkExistenceOwnership
} = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Meetup, {
      path: 'group',
      select: 'name description'
    }),
    getMeetups
  )
  .post(
    protect,
    authorize('publisher', 'admin'),
    checkExistenceOwnership(Group),
    createMeetup
  );

router
  .route('/:id')
  .get(getMeetup)
  .put(
    protect,
    authorize('publisher', 'admin'),
    checkExistenceOwnership(Meetup),
    updateMeetup
  )
  .delete(
    protect,
    authorize('publisher', 'admin'),
    checkExistenceOwnership(Meetup),
    deleteMeetup
  );

module.exports = router;
