var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var bCrypt = require('bCrypt');

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
  }
});

Usr.pre('save', function(next) {
  var usr = this;

  bCrypt.genSalt((err, salt) => {
    if (err) return next(err);

    bCrypt.hash(usr.pass, salt, (err, encrypted) => {
      if (err) return next(err);

      usr.pass = encrypted;
      next();
    });
  });
})

module.exports = mongoose.model('Usr', Usr);
