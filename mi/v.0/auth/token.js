const passport = require('passport');
const TokenStrategy = require('passport-token').Strategy;
const Auth = require('../auth/auth');
const Token = require('../models/token');
const winston = require('winston');

passport.use(new TokenStrategy(
  function(username, token, callback) {

    Auth.verify(token, username)
      .then((d) => {
        callback(null, true);
      })
      .catch((err) => {
        winston.log('error', err);
        callback(null, false);
      })

  }
));

exports.isAuthenticated = passport.authenticate('token', {
  session: false
});
