var mongoose = require('mongoose');

var FactMISchema = mongoose.Schema({
  ID_MI: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MI'
  },
  ID_MIProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MIProvider'
  },
  price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('FactMI', FactMISchema);
