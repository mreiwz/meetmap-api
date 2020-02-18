const express = require('express');
const {
  getMeetups,
  getMeetup,
  createMeetup,
  updateMeetup,
  deleteMeetup
} = require('../controllers/meetups');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getMeetups)
  .post(createMeetup);

router
  .route('/:id')
  .get(getMeetup)
  .put(updateMeetup)
  .delete(deleteMeetup);

module.exports = router;
