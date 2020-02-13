const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Route files
const groups = require('./routes/groups');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Init app
const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/groups', groups);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
  )
);
