var mongoose = require('mongoose');

var ClientSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  rfc: {
    type: String,
    required: false
  },
  mail: {
    type: String,
    unique: true,
    sparse: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
    required: false
  },
  available: {
    type: Boolean,
    required: true
  }

});

module.exports = mongoose.model('Client', ClientSchema);
