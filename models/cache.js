const mongoose = require('../database/mongoose');

const cacheSchema = new mongoose.Schema({
  link: String,
  response: mongoose.Schema.Types.Mixed,
  time: Number
});

const Cache = mongoose.model('cache', cacheSchema);

module.exports = Cache;