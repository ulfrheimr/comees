const passport = require('passport');
const HttpStrategy = require('passport-http').BasicStrategy;
const Usr = require('../controllers/usr')

passport.use(new HttpStrategy({
    passReqToCallback: true
  },
  (req, usr, pass, callback) => {
    req.body["usr"] = usr;

    console.log("USR");
    console.log(usr);

    Usr.verifyUsr(usr, pass)
      .then((u) => {
        if (u)
          return callback(null, u);
        else
          return callback(null, false);
      })
      .catch((err) => {
        return callback(err);
      })
  }
));

exports.isAuthenticated = passport.authenticate('basic', {
  session: false
})
