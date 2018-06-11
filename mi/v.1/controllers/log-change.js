var ChangeAction = require('../models/change-action').ChangeAction;
var LogChange = require('../models/log-change');
const winston = require('winston');

var logAction = (action, usr, mi) => {
  return new Promise((resolve, reject) => {
    var l = new LogChange();
    l.usr = usr;
    l.action = action;
    l.mi = mi;
    l.timestamp = new Date();

    l.save((err, r) => {
      if (err) reject(err);

      resolve(r);
    });
  });
}

var i = {
  log: (action, usr, mi) => {
    try {
      if (!ChangeAction[action])
        throw new Error("Action not allowed")

      logAction(action, usr, mi)
        .then((r) => {
          console.log("MI: " + mi + " changed by " + usr);
          winston.log('debug', "MI: " + mi + " changed by " + usr);
        })
        .catch((err) => {
          winston.log('error', err);
        })

    } catch (err) {
      winston.log('error', err);
    }
  }
}

module.exports = i
