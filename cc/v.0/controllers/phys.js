var Phys = require('../models/phys');
const winston = require('winston');

var savePhys = (phys) => {
  return new Promise((resolve, reject) => {
    var p = new Phys();

    p.mail = phys.mail;
    p.code = phys.code;
    p.phone = phys.phone;
    p.address = phys.address;
    p.external = phys.external;
    p.name = phys.name;
    p.first = phys.first;
    p.last = phys.last;
    p.rfc = phys.rfc;
    p.account = phys.bank_account;

    p.save((err, phys) => {
      if (err) reject(err);

      resolve(phys);
    });
  });
}

var findPhys = (query) => {
  return new Promise((resolve, reject) => {
    Phys.find(query)
      .exec((err, p) => {
        if (err) reject(err);

        resolve(p);
      });
  });
}

var updatePhys = (phys) => {
  return new Promise((resolve, reject) => {
    Phys.findOneAndUpdate({
      _id: phys.id
    }, {
      mail: phys.mail,
      code: phys.code,
      phone: phys.phone,
      address: phys.address,
      external: phys.external,
      name: phys.name,
      first: phys.first,
      last: phys.last,
      rfc: phys.rfc,
      bank_account: phys.account
    }, {
      upsert: true
    }, function(err, phys) {
      if (err) reject(err);
      return resolve(phys);
    });
  });
};

Promise.all([savePhys, findPhys, updatePhys]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var p = {
  putPhys: (req, res, next) => {
    try {
      var p = {
        mail: req.body.mail,
        code: req.body.code,
        phone: req.body.phone,
        address: req.body.address,
        external: req.body.external,
        name: req.body.name,
        first: req.body.first,
        last: req.body.last,
        rfc: req.body.rfc,
        bank_account: req.body.account
      };

      savePhys(p)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          });
        }).catch((err) => res.status(500).send(err));
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getPhyss: (req, res) => {
    try {
      var findExternal = req.query.ext > 0 || false;

      findPhys({
          external: findExternal
        })
        .then((r) => res.json({
          ok: 1,
          data: r
        }))
        .catch((err) => {
          throw err
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },

  getPhys: (req, res) => {
    try {
      var seachField = req.query.by || "id";
      var id = req.params.id;
      var query = {
        _id: id
      }

      switch (seachField) {
        case "code":
          query = {
            code: id
          }
          break;
        case "mail":
          query = {
            mail: id
          }
          break;
      }

      findPhys(query)
        .then((r) => res.json({
          ok: 1,
          data: r
        }))
        .catch((err) => {
          throw err
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  postPhys: (req, res) => {
    try {
      var p = {
        id: req.body.id,
        mail: req.body.mail,
        code: req.body.code,
        phone: req.body.phone,
        address: req.body.address,
        external: req.body.external,
        name: req.body.name,
        first: req.body.first,
        last: req.body.last,
        rfc: req.body.rfc,
        account: req.body.account
      };

      updatePhys(p)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          })
        }).catch((err) => {
          throw err
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  queryPhys: (query) => {

    return findPhys(query);
  }
};

module.exports = p;
