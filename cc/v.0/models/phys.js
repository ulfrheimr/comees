var mongoose = require('mongoose');

var PhysSchema = mongoose.Schema({
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  external: {
    type: Boolean,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  first: {
    type: String,
    required: true
  },
  last: {
    type: String
  },
  address: {
    type: String
  },
  phone: {
    type: String
  },
  mail: {
    type: String,
    unique: true,
    sparse: true
  },
  rfc: {
    type: String
  },
  bank_account: {
    type: String
  },
  payment_schema: {
    type: Object
  }
});

module.exports = mongoose.model('Physician', PhysSchema);
