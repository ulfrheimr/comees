var mongoose = require('mongoose');

var MIProviderSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('MIProvider', MIProviderSchema);
