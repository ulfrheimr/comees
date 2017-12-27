const passport = require('passport');
const TokenStrategy = require('passport-token').Strategy;
const Usr = require('../models/usr')
const Token = require('../auth/sign')

passport.use(new TokenStrategy(
  function(username, token, callback) {
    var token = token;

    console.log("HERE");

    Usr.findOne({
      usr: username
    }, function(err, user) {
      if (err)
        return callback(err);

      if (!user)
        return callback(null, false);

      Token.verifyToken(token)
        .then((decoded) => {
          if (!decoded)
            return callback(null, false);

          if (username != decoded.f)
            return callback(null, false);

          return callback(null, true);
        });

    });
  }
));

exports.authToken = passport.authenticate('token', {
  session: false
});
