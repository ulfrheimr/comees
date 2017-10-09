var mongoose = require('mongoose');

var ClientSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rfc: {
    type: String,
    required: true
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
    required: true
  }
});

module.exports = mongoose.model('Client', ClientSchema);
