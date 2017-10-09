var mongoose = require('mongoose');

var PhysComissionSchema = mongoose.Schema({
  phys: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  bottom: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("PhysComission", PhysComissionSchema);
