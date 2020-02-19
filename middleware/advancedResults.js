const advancedResults = (model, populate) => async (req, res, next) => {
  // Test
  console.log(`Passing through advancedResults middleware...`);

  // Make copy of req.query
  const reqQuery = { ...req.query };
  console.log(reqQuery);
  if (req.params.groupId) {
    reqQuery.group = req.params.groupId;
  }
  console.log(reqQuery);

  // Create array of fields to exclude, not to be matched for filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(item => delete reqQuery[item]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, $lt, $lte, $in)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Find resources
  query = model.find(JSON.parse(queryStr));

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
  const total = await model.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Population
  if (populate) {
    query = query.populate(populate);
  }

  // Actually execute the query
  const results = await query;

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

  // Create results object to send
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };
  next();
};

module.exports = advancedResults;
