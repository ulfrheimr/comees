var mongoose = require('mongoose');

var CouponSchema = mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  init_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('Coupon', CouponSchema);
