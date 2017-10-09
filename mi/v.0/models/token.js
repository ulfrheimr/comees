var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var Token = new Schema({
  usr: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Token', Token);
