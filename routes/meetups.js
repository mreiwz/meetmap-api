const express = require('express');
const {
  getMeetups,
  getMeetup,
  createMeetup,
  updateMeetup,
  deleteMeetup
} = require('../controllers/meetups');

const Meetup = require('../models/Meetup');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Bring in protect from auth middleware in order to protect routes
const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Meetup, {
      path: 'group',
      select: 'name description'
    }),
    getMeetups
  )
  .post(protect, createMeetup);

router
  .route('/:id')
  .get(getMeetup)
  .put(protect, updateMeetup)
  .delete(protect, deleteMeetup);

module.exports = router;
