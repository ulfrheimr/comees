var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
const bCrypt = require('bcrypt-nodejs');

var Usr = new Schema({
  usr: {
    type: String,
    required: true,
    unique: true
  },
  pass: {
    type: String,
    required: true,
  },
  linkedUsr: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  active: {
    type: Boolean,
    required: true,
  }
});

Usr.pre('save', function(next) {
  var usr = this;

  console.log("SAVE");

  bCrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bCrypt.hash(usr.pass, salt, null, (err, encrypted) => {
      if (err) return next(err);

      usr.pass = encrypted;
      next();
    });
  });
})

module.exports = mongoose.model('Usr', Usr);
