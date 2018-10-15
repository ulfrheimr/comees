var PhysComission = require('../models/phys-comission');
var Phys = require('../models/phys');
const winston = require('winston')

var saveComission = (com) => {
  return new Promise((resolve, reject) => {
    var p = new PhysComission();

    p.phys = com.physId;
    p.bottom = com.bottom;
    p.percentage = com.perc;
    console.log(p);

    p.save((err, r) => {
      if (err) reject(err);

      resolve(r);
    });
  });
}

var findComission = (query) => {
  return new Promise((resolve, reject) => {
    PhysComission.find(query)
      .sort({
        bottom: -1
      })
      .exec((err, coms) => {
        if (err) reject(err);
        resolve(coms);
      });
  });
}


Promise.all([saveComission]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var c = {
  putPhysComission: (req, res) => {
    try {
      var idPhys = req.body.physId;
      var bottom = req.body.bottom;
      var perc = req.body.perc;

      Phys.getPhys({
          id: idPhys
        }).then((p) => {
          if (!p) throw {
            message: "Phys not found"
          }

          saveComission({
              physId: p.data["_id"],
              bottom: bottom,
              perc: perc
            })
            .then((c) => {
              res.json({
                ok: 1,
                data: c
              });
            })
            .catch((err) => {
              throw err
            });
        })
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
  getPhysCommission: (req, res) => {
    try {
      findComission({
          phys: req.params.id
        })
        .then((c) => {
          res.json({
            ok: 1,
            data: c
          })
        })
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
  queryPhysComission: (query) => {
    return findComission(query);
  }
};

module.exports = c;
