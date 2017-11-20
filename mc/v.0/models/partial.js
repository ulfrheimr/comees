var mongoose = require('mongoose');

var PartialSchema = mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  client_name: {
    type: String,
    required: true
  },
  mcs: [{
    qty: {
      type: Number
    },
    mc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MC'
    },
    phys: {
      type: mongoose.Schema.Types.ObjectId,
    },
    sale_price: {
      type: Number,
      required: true
    },
    observations: {
      type: String
    }
  }],
  open: {
    type: Boolean
  },
  sale_id: {
    type: String
  },
  payments: [{
    payment: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  }]
});

module.exports = mongoose.model('Partial', PartialSchema);
