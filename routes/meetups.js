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

router
  .route('/')
  .get(
    advancedResults(Meetup, {
      path: 'group',
      select: 'name description'
    }),
    getMeetups
  )
  .post(createMeetup);

router
  .route('/:id')
  .get(getMeetup)
  .put(updateMeetup)
  .delete(deleteMeetup);

module.exports = router;
