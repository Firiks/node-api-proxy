const mongoose = require('mongoose');

const logger = require('../utils/logger');

// todo: move to config
const connection = mongoose.connect('mongodb://root:password@localhost:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'proxyDB',
});

connection.then(() => {
  logger.info('MongoDB connected successfully');
}).catch((err) => {
  console.log(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.error('MongoDB disconnected');
});

module.exports = mongoose;