const mongoose = require('../database/mongoose');

const tokensSchema = new mongoose.Schema({
  host: String,
  token_name: String,
  token_value: String,
  type: String,
  ttl: Number // how long to store before refreshing
});

const Tokens = mongoose.model('tokens', tokensSchema);

module.exports = Tokens;