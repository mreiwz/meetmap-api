const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Group = require('../models/Group');
const fs = require('fs');
const path = require('path');

// @desc      Get all groups
// @route     GET /api/V1/groups
// @access    Public
exports.getGroups = asyncHandler(async (req, res, next) => {
  // Send response back
  res.status(200).json(res.advancedResults);
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
  // Include userId in req.body so that the user field can be filled
  req.body.user = req.user.id;
  // If user is not admin, check if user has already published group
  if (req.user.role !== 'admin') {
    const publishedGroup = await Group.findOne({ user: req.user.id });
    if (publishedGroup) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} has already published a group`,
          400
        )
      );
    }
  }
  const group = await Group.create(req.body);
  res.status(201).json({ success: true, data: group });
});

// @desc      Update group
// @route     PUT /api/V1/groups/:id
// @access    Private
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

  group = await Group.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: group });
});

// @desc      Delete group
// @route     DELETE /api/V1/groups/:id
// @access    Private
exports.deleteGroup = asyncHandler(async (req, res, next) => {
  // Delete photo from files if group had one
  if (group.photo !== 'no-photo.jpg') {
    const file = `${process.env.FILE_UPLOAD_PATH}/${group.photo}`;
    if (fs.existsSync(file)) {
      console.log(
        `Middleware running: deleting photo from group ${req.params.id}`
      );
      fs.unlinkSync(file);
    }
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

// @desc      Upload photo for group
// @route     PUT /api/V1/groups/:id/photo
// @access    Private
exports.groupPhotoUpload = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a photo`, 400));
  }

  const file = req.files.file;
  // Check that the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(
      new ErrorResponse(
        `Please upload a valid photo. Valid types include JPG, PNG, GIF, BMP, others`,
        400
      )
    );
  }
  // Check max file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Your file is ${(file.size / 1048576).toFixed(
          2
        )}MB and exceeds the maximum file size limit, ${(
          process.env.MAX_FILE_UPLOAD / 1048576
        ).toFixed(2)}MB`,
        400
      )
    );
  }
  // Create custom filename so that files cannot overwrite each other
  file.name = `photo_${group._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(
        new ErrorResponse(
          `There was a problem uploading your file, try again`,
          500
        )
      );
    }
    // If no error, actually put image URL in database and send successful response
    await Group.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
