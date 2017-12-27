var jwt = require('jsonwebtoken');
var config = require('../../config');

var i = {
  spreadToken: (usr) => {
    return new Promise((resolve, reject) => {
      try {
        var token = i.makeToken(usr);

        resolve(token);
      } catch (err) {
        reject(err);
      }

    });
  },
  makeToken: (field) => {
    var token = jwt.sign({
      f: field
    }, config.s, {
      expiresIn: config.token_expiration
    });

    return token;
  },
  verifyToken: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.s, function(err, decoded) {
        if (err)
          console.log("ERR");

        resolve(decoded);
      });
    });

  }
}

module.exports = i;
