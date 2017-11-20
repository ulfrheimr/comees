const Usr = require('../models/usr');
const UsrMap = require('../models/usrmap');
const bCrypt = require('bCrypt');
const Token = require('../auth/sign');
const logging = require("../../utils")
const winston = require('winston');
const SalesMan = require('./salesman');

var typesUsr = {
  1: "salesman"
}

var registerType = (username, type) => {
  return new Promise((resolve, reject) => {
    try {
      var usrmap = new UsrMap({
        usrname: username,
        type: type
      })

      usrmap.save(function(err, usr) {
        if (err) reject(err);

        resolve(usr);
      })
    } catch (err) {
      throw err;
    }
  })
}

var register = (u) => {
  return new Promise((resolve, reject) => {
    try {
      var usr = new Usr({
        usr: u.usr,
        pass: u.pass,
        linkedUsr: u.linkedUsr,
        active: true
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

      if (err)
        return reject(err);

      if (!usr)
        return reject(null, false);
      return resolve({
        usr: usr.usr,
        id: usr.linkedUsr
      });
    })
  });
}

var findRole = (username) => {
  return new Promise((resolve, reject) => {
    UsrMap.findOne({
      usrname: username
    }, (err, usrmap) => {

      if (err)
        return reject(err);

      if (!usrmap)
        return reject(null, false);

      return resolve(usrmap);
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
        usr: usr.usr,
        linkedUsr: usr.linkedUsr
      }, (err, u) => {
        console.log(u);

        if (u)
          reject({
            "message": "Usr already register"
          })
        else {
          register(usr)
            .then((r) => {
              registerType(usr.usr, usr.type)
                .then((r) => resolve(r))
                .catch((err) =>
                  reject(err))
            })
            .catch((err) =>
              reject(err))
        }
      })
    } catch (err) {
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
    find(req.body.usr)
      .then((u) => {

        findRole(req.body.usr)
          .then((usrrole) => {

            switch (parseInt(usrrole.type)) {
              case 1:
                SalesMan.querySalesMan({
                    _id: u.id
                  })
                  .then((r) => {
                    r = r[0];

                    var send_usr = {
                      name: r.name,
                      id: r["_id"],
                      role: JSON.parse(r.role),
                      usr: req.body.usr
                    }

                    res.json({
                      ok: 1,
                      usr: send_usr
                    })

                  })
                  .catch((err) => {
                    winston.log('error', err);
                    res.status(500).send(err)
                  })
                break;
              default:

            }
          })
          .catch((err) => {
            winston.log('error', err);
            res.status(500).send(err)
          })

        // res.json({
        //   ok: 1,
        //   usr: u,
        //   token: req.body.token
        // })
      })
      .catch((err) => {
        winston.log('error', err);
        res.status(500).send(err)
      });
  },
  linkUsr: (req, res) => {
    try {
      var u = {
        usr: req.body.usrname,
        pass: req.body.pass,
        linkedUsr: req.body.usr,
        type: req.body.type
      };

      if (!typesUsr[u.type])
        throw new Error("Usr type needs to be defined");

      if (u.linkedUsr == undefined)
        throw new Error("Usr needs to be defined");

      linkUsr(u)
        .then((r) => {
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
