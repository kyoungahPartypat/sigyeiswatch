var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/sigye');

var schema = new mongoose.Schema({
  name: String,
  level: Number,
  money: Number,
  noFarewell: Number,
  present: Number,
  coupling: Number,
  car: Number,
  house: Number,
  land: Number
});

module.exports = mongoose.model('Girlfriend', schema);

