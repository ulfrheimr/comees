var mongoose = require('mongoose');

var McSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  description: {
    type: String
  },
  suggested_price: {
    type: Number,
    required: true
  }

});

module.exports = mongoose.model('MC', McSchema);
