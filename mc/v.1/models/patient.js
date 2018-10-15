var mongoose = require('mongoose');

var PatientSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  gender: {
    type: Number,
    required: false
  },
  age: {
    type: Number,
    required: false
  },
  address: {
    i: {
      type: String,
      required: false
    },
    cp: {
      type: String,
      required: false
    },
    loc: {
      type: String,
      required: false
    },
    state: {
      type: String,
      required: false
    }
  },
  phone: {
    type: String,
  },
  mobile: {
    type: String,
  },
  activity: {
    type: String,
  },
  mail: {
    type: String,
    unique: true,
    sparse: true
  },
  marital_status: {
    type: String,
  },
  additional_info: [{
    type_info: {
      type: Number,
      required: false
    },
    i: {
      type: Object,
      required: false
    }
  }],
  timestamp: {
    type: Date,
    required: true
  },
  available: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('Patient', PatientSchema);
