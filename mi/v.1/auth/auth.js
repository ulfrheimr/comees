var jwt = require('jsonwebtoken');
var config = require('../../config');
var Token = require('../models/token');
const winston = require('winston');

var saveToken = (usr, token) => {
  return new Promise((resolve, reject) => {
    var t = new Token({
      usr: usr,
      token: token
    });

    t.save((err, r) => {
      if (err) reject(err);

      resolve({
        usr: usr,
        token: token
      })
    })
  });
}

var deleteToken = (usr, token) => {

}

Promise.all([saveToken]).catch((error) => {
  winston.log('error', err);
  console.log(error);
  return Promise.reject(error.message || error);
});


var a = {
  init: (req, res) => {
    var token = req.headers["x-token"];
    var usr = req.headers["x-username"];

    a.verifyToken(token, usr)
      .then((t) => {
        if (t.f == usr) {
          res.json({
            ok: 1,
            token: token
          })
        }
      })
      .catch((err) => {
        winston.log('error', err);
        res.status(500).send({
          code: err.code
        });
      });
  },
  verifyToken: (token, usr) => {
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(token, config.s, function(err, decoded) {
          if (err)
            reject(err);

          if (decoded.f == usr) {
            saveToken(usr, token)
              .then((t) => {
                resolve(decoded);
              })
              .catch((err) => {
                reject(err);
              });
          } else
            reject("User invalid authentication");
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  verify: (token, username) => {
    return new Promise((resolve, reject) => {
      Token.findOne({
        usr: username
      }, (err, user) => {
        if(err) reject(err)

        if(!usr) reject("User not found")

        
        console.log(user);
        resolve({})
      })

    });
  }
}

module.exports = a;
