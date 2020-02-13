// @desc      Get all groups
// @route     GET /api/V1/groups
// @access    Public
exports.getGroups = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Display all groups` });
};

// @desc      Get single group
// @route     GET /api/V1/groups/:id
// @access    Public
exports.getGroup = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Display group ${req.params.id}` });
};

// @desc      Create new group
// @route     POST /api/V1/groups
// @access    Private
exports.createGroup = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Create new group' });
};

// @desc      Update group
// @route     PUT /api/V1/groups/:id
// @access    Private
exports.updateGroup = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Update group ${req.params.id}` });
};

// @desc      Delete group
// @route     DELETE /api/V1/groups/:id
// @access    Private
exports.deleteGroup = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Delete group ${req.params.id}` });
};
