var mongoose = require('mongoose');

var LoginSchema = mongoose.Schema({
  usr: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  init_login: {
    type: Date,
    required: true
  },
  end_login: {
    type: Date
  },
  is_closed: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('Login', LoginSchema);
