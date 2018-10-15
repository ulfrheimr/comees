var mongoose = require('mongoose');

var SalesMan = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: Object
  },
  phone: {
    type: String,
  },
  available: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('SalesMan', SalesMan);
