var mongoose = require('mongoose');

var CatSchema = mongoose.Schema({
  name: String
});

module.exports = mongoose.model('Category', CatSchema);
