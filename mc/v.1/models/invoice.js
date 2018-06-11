var mongoose = require('mongoose');

var InvoicedMISchema = mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  is_invoiced: {
    type: Boolean,
    required: true
  },
  serial: {
    type: String
  }
});

module.exports = mongoose.model('InvoicedMI', InvoicedMISchema);
