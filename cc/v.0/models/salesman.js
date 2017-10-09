var mongoose = require('mongoose');

var SalesMan = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: Object
  },
  mail: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
  }
});

module.exports = mongoose.model('SalesMan', SalesMan);
