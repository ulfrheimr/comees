var mongoose = require('mongoose');

var ClientSchema = mongoose.Schema({
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
  phone: {
    type: String,
  },
  address: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Client', ClientSchema);
