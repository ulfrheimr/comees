var mongoose = require('mongoose');

var SaleSchema = mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  usr: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentType: {
    type: String,
    required: true
  },
  paymentAccount: {
    type: String
  },
  auth: {
    type: String
  },
  from_partial:{
    type: Boolean
  },
  mcs: [{
    qty: {
      type: Number
    },
    mc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MC',
      required: true
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
  }]
});

module.exports = mongoose.model('Sale', SaleSchema);
