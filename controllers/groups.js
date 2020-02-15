const ErrorResponse = require('../utils/errorResponse');
const Group = require('../models/Group');

// @desc      Get all groups
// @route     GET /api/V1/groups
// @access    Public
exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find();
    res.status(200).json({ success: true, count: groups.length, data: groups });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, msg: `There was an error, try again` });
  }
};

// @desc      Get single group
// @route     GET /api/V1/groups/:id
// @access    Public
exports.getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return next(
        new ErrorResponse(`Group not found with id:${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

// @desc      Create new group
// @route     POST /api/V1/groups
// @access    Private
exports.createGroup = async (req, res, next) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res
      .status(400)
      .json({ sucess: false, msg: `There was an error, try again` });
  }
};

// @desc      Update group
// @route     PUT /api/V1/groups/:id
// @access    Private
exports.updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, msg: `There was an error, try again` });
    }
    res.status(200).json({ success: true, data: group });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, msg: `There was an error, try again` });
  }
};

// @desc      Delete group
// @route     DELETE /api/V1/groups/:id
// @access    Private
exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, msg: `There was an error, try again` });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, msg: `There was an error, try again` });
  }
};
