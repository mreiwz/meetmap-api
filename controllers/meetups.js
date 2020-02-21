const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Meetup = require('../models/Meetup');
const Group = require('../models/Group');

// @desc      Get all meetups
// @route     GET /api/V1/meetups
// @desc      Get all meetups for a specific single group
// @route     GET /api/V1/groups/:groupId/meetups
// @access    Public

exports.getMeetups = asyncHandler(async (req, res, next) => {
  // TODO: if getting meetups for a specific group, don't use advancedResults middleware (currently, still passes through)
  // if (req.params.groupId) {
  //   const meetups = await Meetup.find({ group: req.params.groupId });
  //   return res
  //     .status(200)
  //     .json({ success: true, count: meetups.length, data: meetups });
  // } else {
  res.status(200).json(res.advancedResults);
  // }
});

// @desc      Get single meetup
// @route     GET /api/V1/meetups/:id
// @access    Public
exports.getMeetup = asyncHandler(async (req, res, next) => {
  const meetup = await Meetup.findById(req.params.id).populate({
    path: 'group',
    select: 'name description'
  });
  if (!meetup) {
    return next(
      new ErrorResponse(`Meetup not found with id:${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: meetup });
});

// @desc      Create new meetup for a specific single group
// @route     POST /api/V1/groups/:groupId/meetups
// @access    Private
exports.createMeetup = asyncHandler(async (req, res, next) => {
  // Include :groupId in req.body so that the group field can be filled
  req.body.group = req.params.groupId;
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id:${req.params.groupId}`, 404)
    );
  }
  const meetup = await Meetup.create(req.body);
  res.status(201).json({ success: true, data: meetup });
});

// @desc      Update meetup
// @route     PUT /api/V1/meetups/:id
// @access    Private
exports.updateMeetup = asyncHandler(async (req, res, next) => {
  const meetup = await Meetup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!meetup) {
    return next(
      new ErrorResponse(`Meetup not found with id:${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: meetup });
});

// @desc      Delete meetup
// @route     DELETE /api/V1/meetups/:id
// @access    Private
exports.deleteMeetup = asyncHandler(async (req, res, next) => {
  const meetup = await Meetup.findById(req.params.id);
  if (!meetup) {
    return next(
      new ErrorResponse(`Group not found with id:${req.params.id}`, 404)
    );
  }
  await meetup.remove();
  res.status(200).json({ success: true, data: {} });
});
