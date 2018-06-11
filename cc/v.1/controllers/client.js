var Client = require('../models/client')
var guid = require("guid")
var moment = require('moment')
var pad = require('pad')

const winston = require('winston');
var saveClient = (client) => {
  return new Promise((resolve, reject) => {
    var c = new Client();

    c.name = client.name;
    c.rfc = client.rfc;
    c.phone = client.phone;
    c.address = client.address;
    c.timestamp = new Date();
    c.mail = client.mail;
    c._id = client._id;
    c.available = 1;

    c.save((err, phys) => {
      if (err) reject(err);

      resolve(phys);
    });
  });
}

var findClient = (query) => {
  return new Promise((resolve, reject) => {
    Client.find(query)
      .exec((err, p) => {
        if (err) reject(err);

        resolve(p);
      });
  });
}

var clientSequential = () => {
  return new Promise((resolve, reject) => {

    Client.findOne({}, {}, {
      sort: {
        'timestamp': -1
      }
    }, function(err, current) {
      if (err) reject(err);

      resolve(current);
    });
  });
}


Promise.all([saveClient, findClient]).catch((error) => {
  console.log(error);
  return Promise.reject(error.message || error);
});

var c = {
  putClient: (req, res) => {
    try {
      var p = {
        name: req.body.name,
        rfc: req.body.rfc,
        phone: req.body.phone,
        mail: req.body.mail == "" ? guid.create() : req.body.mail,
        address: req.body.address
      };

      clientSequential()
        .then((s) => {
          var curr = moment().format('YYYYMMDD')
          var seq = 1;

          if (s)
            seq = parseInt(s._id.split("-")[1]) + 1

          var curr = moment().format('YYYYMMDD') + "-" + pad(2, seq + "", '0')
          p["_id"] = curr

          console.log(p);

          saveClient(p)
            .then((r) => {
              res.json({
                ok: 1,
                data: r
              });
            }).catch((err) => {
              throw err;
            });
        })
        .catch((err) => {

        })


    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getClient: (req, res) => {
    try {
      var searchField = req.query.by;
      var id = req.params.id;
      var query = {};

      if (searchField == "name" ||
        searchField == "mail" ||
        searchField == "rfc" ||
        searchField == "clientId") {

        query = {
          [searchField]: {
            $regex: ".*" + id + ".*",
            $options: 'i'
          }
        }
      }

      findClient(query)
        .then((r) => res.json({
          ok: 1,
          data: r
        }))
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getClients: (req, res) => {
    try {
      var seachField = req.query.by || "name";
      var id = req.query.search;

      var query = {
        [seachField]: {
          $regex: ".*" + id + ".*",
          $options: 'i'
        }
      }

      findClient(query)
        .then((r) => res.json({
          ok: 1,
          data: r
        }))
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  }
}

module.exports = c;
