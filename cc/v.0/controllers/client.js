var Client = require('../models/client');
var guid = require("guid");

const winston = require('winston');
var saveClient = (client) => {
  return new Promise((resolve, reject) => {
    var c = new Client();

    c.name = client.name;
    c.rfc = client.rfc;
    c.phone = client.phone;
    c.address = client.address;
    c.mail = client.mail;

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

      saveClient(p)
        .then((r) => {
          console.log(r);
          res.json({
            ok: 1,
            data: r
          });
        }).catch((err) => {
          throw err;
        });
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
        searchField == "rfc") {
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

      console.log(query);

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
  // queryClient: (id) => {
  //   var query = {
  //     _id: id
  //   };
  //
  //   return findClient(query)
  // }

}

module.exports = c;
