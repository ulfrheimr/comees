var mongoose = require('mongoose');

var PhysicianMISchema = mongoose.Schema({
  phys: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  mi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MI',
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  sale_price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('PhysMI', PhysicianMISchema);
