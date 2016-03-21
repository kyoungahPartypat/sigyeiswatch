var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
mongoose.createConnection('mongodb://localhost/sigye');

autoIncrement.initialize(mongoose);

var schema = new mongoose.Schema({
  name: String,
  path: String
});

schema.plugin(autoIncrement.plugin, {
  model: 'Watch',
  field: 'idx',
  startAt: 0,
  incrementBy: 1
});

module.exports = mongoose.model('Watch', schema);
