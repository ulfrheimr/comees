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
  mis: [{
    qty: {
      type: Number
    },
    mi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MI'
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

module.exports = mongoose.model('Partial', PartialSchema);
