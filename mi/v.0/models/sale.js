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
  mis: [{
    qty: {
      type: Number
    },
    mi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MI',
      required: true
    },
    sale_price: {
      type: Number,
      required: true
    },
    discount: {
      type: String
    },
    type_discount: {
      type: String
    }
  }]
});

module.exports = mongoose.model('Sale', SaleSchema);
