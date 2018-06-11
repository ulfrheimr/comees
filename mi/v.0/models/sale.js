var mongoose = require('mongoose');

var SaleSchema = mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  client_name: {
    type: String,
    required: false
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
  status: {
    type: Number
  }
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
    },
    timestamp: {
      type: Date,
      required: true
    },
    usr: {
      type: String,
      required: true
    },
  }],
  payments: [{
    payment: {
      type: Number,
      required: true
    },
    usr: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  }]
});

module.exports = mongoose.model('Sale', SaleSchema);
