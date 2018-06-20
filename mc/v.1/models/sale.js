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
  client: {
    type: String,
    required: false
  },
  client_name: {
    type: String,
    required: false
  },
  status: {
    type: Number
  },
  mcs: [{
    qty: {
      type: Number
    },
    mc: {
      type: Object,
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
    },
    timestamp: {
      type: Date,
      required: true
    },
    usr: {
      type: String,
      required: true
    }
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
    }
  }]
});

module.exports = mongoose.model('MCSale', SaleSchema);
