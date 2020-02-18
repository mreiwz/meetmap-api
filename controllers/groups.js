const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Group = require('../models/Group');

// @desc      Get all groups
// @route     GET /api/V1/groups
// @access    Public
exports.getGroups = asyncHandler(async (req, res, next) => {
  // Make copy of req.query
  const reqQuery = { ...req.query };

  // Create array of fields to exclude, not to be matched for filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(item => delete reqQuery[item]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, $lt, $lte, $in)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Find resources
  query = Group.find(JSON.parse(queryStr)).populate({
    path: 'meetups',
    select: 'title description'
  });

  // Select fields to send back
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Test for sort and actually sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Default sort
    query = query.sort('name');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Group.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Actually execute the query
  const groups = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  // Send response back
  res
    .status(200)
    .json({ success: true, count: groups.length, pagination, data: groups });
});

// @desc      Get single group
// @route     GET /api/V1/groups/:id
// @access    Public
exports.getGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.id).populate({
    path: 'meetups',
    select: 'title description'
  });
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
// TODO!: if update address, run geocoder again
exports.updateGroup = asyncHandler(async (req, res, next) => {
  if (req.body.address) {
    const loc = await geocoder.geocode(req.body.address);
    req.body.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].countryCode
    };
  }

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
  const group = await Group.findById(req.params.id);
  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id:${req.params.id}`, 404)
    );
  }
  await group.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc      Get groups within radius
// @route     GET /api/V1/groups/radius/:zipcode/:distance
// @access    Public
exports.getGroupsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  // Get latitude and longitude from zipcode with geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  // Calculate radius if radiusEarth=3960mi
  const radius = distance / 3960;
  const groups = await Group.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });
  res.status(200).json({ success: true, count: groups.length, data: groups });
});
