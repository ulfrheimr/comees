var mongoose = require('mongoose');

var UsrMapSchema = mongoose.Schema({
  usrname: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('UsrMap', UsrMapSchema);
