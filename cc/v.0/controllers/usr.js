const Usr = require('../models/usr');
const bCrypt = require('bCrypt');
const Token = require('../auth/sign');
const logging = require("../../utils")
const winston = require('winston');

var register = (u) => {
  return new Promise((resolve, reject) => {
    try {
      var usr = new Usr({
        usr: u.usr,
        pass: u.pass,
        linkedUsr: u.linkedUsr
      })

      usr.save(function(err, usr) {
        if (err) reject(err);

        resolve({
          usr: usr.usr
        });
      })
    } catch (err) {
      throw err;
    }
  })
}

var find = (username) => {
  return new Promise((resolve, reject) => {
    Usr.findOne({
      usr: username
    }, (err, usr) => {
      console.log(usr);

      if (err)
        return reject(err);

      if (!usr)
        return reject(null, false);

      return resolve(null, usr);
    })
  });
}

var verify = (username, pass) => {
  return new Promise((resolve, reject) => {
    Usr.findOne({
      usr: username
    }, (err, usr) => {
      if (err)
        return reject(err);

      if (!usr)
        return resolve(null, false);

      bCrypt.compare(pass, usr.pass, function(err, res) {
        if (res) {
          resolve({
            usr: usr.usr,
            name: usr.name
          })
        } else {
          resolve(null, false)
        }
      });
    })
  });
}

var linkUsr = (usr) => {
  return new Promise((resolve, reject) => {

    try {
      Usr.findOne({
        usr: usr.usr
      }, (err, u) => {
        if (u)
          reject({
            "message": "UsrName already register"
          })
        else {
          register(usr)
            .then((r) =>
              resolve(r)
            )
            .catch((err) =>
              reject(err)
            )
        }
      })
    } catch (err) {
      console.log("asdsd");
      reject(err);
    }
  });
}


Promise.all([verify, find, register, linkUsr]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var u = {
  signUp: (req, res) => {
    var usr = {
      usr: req.body.usr,
      pass: req.body.pass,
      name: req.body.name
    }
    register(usr)
      .then((usr) => {
        res.json({
          ok: 1,
          usr: usr
        })
      }).catch((err) => {
        winston.log('error', err);
        res.status(500).send(err)
      })
  },
  login: (req, res) => {
    res.json({
      usr: req.body.usr,
      token: req.body.token
    })

  },
  linkUsr: (req, res) => {
    try {
      var u = {
        usr: req.body.usrname,
        pass: req.body.pass,
        linkedUsr: req.body.usr
      };

      if (u.linkedUsr == undefined)
        throw new Error("Usr needs to be defined");

      linkUsr(u)
        .then((r) => {
          console.log(r);
          res.json({
            ok: 1,
            data: r
          });
        }).catch((err) => {
          winston.log('error', err);
          res.status(500).json({
            err: err.message
          });
        });

    } catch (err) {

      winston.log('error', err);
      res.status(500).json({
        err: err.message
      })
    }
  },
  spread: (req, res, next) => {
    var usr = req.body.usr;
    Token.spreadToken(usr)
      .then((token) => {
        req.body["token"] = token;
        next();
      })
      .catch((err) => {
        winston.log('error', err);
        res.status(500).send(err);
      });
  },
  verifyUsr: (usr, pass) => {
    return verify(usr, pass);
  }

}

module.exports = u;
