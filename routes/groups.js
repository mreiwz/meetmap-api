const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupsInRadius
} = require('../controllers/groups');

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
