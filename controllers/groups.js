const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Group = require('../models/Group');

// @desc      Get all groups
// @route     GET /api/V1/groups
// @access    Public
exports.getGroups = asyncHandler(async (req, res, next) => {
  const groups = await Group.find();
  res.status(200).json({ success: true, count: groups.length, data: groups });
});

// @desc      Get single group
// @route     GET /api/V1/groups/:id
// @access    Public
exports.getGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id:${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: group });
});

// @desc      Create new group
// @route     POST /api/V1/groups
// @access    Private
exports.createGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.create(req.body);
  res.status(201).json({ success: true, data: group });
});

// @desc      Update group
// @route     PUT /api/V1/groups/:id
// @access    Private
exports.updateGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id:${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: group });
});

// @desc      Delete group
// @route     DELETE /api/V1/groups/:id
// @access    Private
exports.deleteGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findByIdAndDelete(req.params.id);
  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id:${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: {} });
});
