const Usr = require('../models/usr');
const UsrMap = require('../models/usrmap');
const bCrypt = require('bcrypt-nodejs');
const Token = require('../auth/sign');
const logging = require("../../utils")
const winston = require('winston');
const SalesMan = require('./salesman');
const Login = require('../models/login')
const moment = require('moment');
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

// LOGIN MANAGEMENT
var loglogin = (idUsr) => {
  return new Promise((resolve, reject) => {
    try {
      Login.findOne({
          usr: idUsr,
        })
        .sort({
          init_login: -1
        })
        .exec((err, p) => {
          if (err) reject(err);
          var l = new Login({
            usr: idUsr,
            init_login: new Date(),
            is_closed: false
          });

          if (!p) {
            l.save(function(err, usr) {
              if (err) reject(err);

              resolve(true);
            });
          } else {


            var yesterday = moment().subtract(1, 'd');
            var last_login = moment(p["init_login"]);

            if (last_login.isBefore(yesterday, 'd')) {
              l.save(function(err, usr) {
                if (err) reject(err);
                resolve(true);
              });
            } else {
              resolve(true);
            }

          }
        });
    } catch (err) {
      reject(err);
    }
  })
}

var getLogin = (usr, is_closed = undefined) => {
  return new Promise((resolve, reject) => {
    try {
      find(usr)
        .then((u) => {
          var query = {
            usr: u.id,
          }

          if (is_closed != undefined) {
            query["is_closed"] = is_closed
          }

          Login.findOne(query)
            .sort({
              init_login: -1
            })
            .exec((err, p) => {
              if (err) reject(err);

              resolve(p);
            });
        })
        .catch((err) => {
          winston.log('error', err);
        });
    } catch (err) {
      reject(err);
    }
  });
}

var delLogin = (usr) => {
  return new Promise((resolve, reject) => {
    try {
      find(usr)
        .then((u) => {
          Login.findOne({
              usr: u.id,
              is_closed: false
            })
            .sort({
              init_login: -1
            })
            .exec((err, p) => {


              if (err) reject(err);

              if (!p) {
                reject({
                  msg: "Login not found",
                  err: 1
                });
              } else {
                var last_login = moment(p["init_login"]);

                // Check if login to close is from today
                if (last_login.isSame(moment(), 'd')) {
                  Login.findOneAndUpdate({
                    _id: p._id
                  }, {
                    $set: {
                      is_closed: true,
                      end_login: new Date()
                    }
                  }, {
                    new: true
                  }, function(err, doc) {
                    if (err) {
                      reject(err)
                    }
                    resolve(true)
                  });
                } else {
                  reject({
                    msg: "Session too old to logout",
                    err: 2
                  });
                }
              }
            });
        })
        .catch((err) => {
          winston.log('error', err);
        });
    } catch (err) {
      reject(err);
    }
  })
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
        console.log("USER FOUND");
        loglogin(u.id)
          .then((is_logged) => {
            console.log("LOGIN LOGGED");
            findRole(req.body.usr)
              .then((usrrole) => {
                console.log("ROLE GOT");
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
                          usr: req.body.usr,
                          token: req.body.token
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
          })
          .catch((err) => {
            winston.log('error', err);
            res.status(500).send(err)
          })
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
  },
  getLogin: (req, res) => {
    var usr = req.headers["x-username"];
    var is_closed = req.query.is_closed

    getLogin(usr, is_closed)
      .then((r) => {
        res.json({
          ok: 1,
          data: r
        });
      })
      .catch((err) => {
        winston.log('error', err);
        res.status(500).send(err);
      })
  },
  deleteLogin: (req, res) => {
    var usr = req.headers["x-username"];

    delLogin(usr)
      .then((r) => {
        res.json({
          ok: 1
        });
      })
      .catch((err) => {
        winston.log('error', err);
        res.status(500).send(err);
      })
  }
}

module.exports = u;
