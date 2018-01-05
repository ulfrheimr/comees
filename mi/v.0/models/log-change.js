var mongoose = require('mongoose');

var LogChangeSchema = mongoose.Schema({
  usr: {
    type: String,
    required: true
  },
  action: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  mi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MI',
    required: true
  },
  desc: {
    type: String
  }
});

module.exports = mongoose.model('LogChange', LogChangeSchema);
