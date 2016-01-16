var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sigye');

var schema = new mongoose.Schema({
  name: String,
  path: String,
  user: String,
  noncommercial: String,
  secondCreation: String,
  tag: String
});

module.exports = mongoose.model('Photo', schema);
