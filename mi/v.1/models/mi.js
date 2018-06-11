var mongoose = require('mongoose');

var MISchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  delivery_time: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  description: {
    type: String
  },
  sample: {
    type: String
  }
});

module.exports = mongoose.model('MI', MISchema);
