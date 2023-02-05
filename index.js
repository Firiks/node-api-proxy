// node includes
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// local files
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error');
const proxyRoutes  = require('./routes/api');

// load .env
require('dotenv').config();

// constants
const PORT = process.env.SERVER_PORT || 5000;

// express instance
const app = express();

// max 100 request per 5 minutes
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 Mins
  max: 100,
  message: 'Too many requests, please try again later'
});

app.use(limiter);

app.set('trust proxy', 1);

// enable cors
app.use(cors());

// handle json
app.use(express.json());

// handle url encoded data
app.use(express.urlencoded({ extended: false }));

// handle errors
app.use(errorHandler);

// api proxy route
app.use('/api', proxyRoutes);

app.listen(PORT, () => {
  logger.info(`Express is listening on http://localhost:${PORT}`);
});