var FactMI = require('../models/fact-mi');

var MIController = require('./mi');
var MIProviderController = require('./mi-provider');
const winston = require('winston');

var saveFactMI = (mi) => {
  return new Promise((resolve, reject) => {
    var fm = {
      ID_MI: mi.mi,
      ID_MIProvider: mi.provider,
      price: mi.price
    }

    FactMI.findOneAndUpdate({
      ID_MI: fm.ID_MI,
      ID_MIProvider: fm.ID_MIProvider
    }, fm, {
      upsert: true
    }, function(err, m) {
      if (err) reject(err);
      return resolve(m);
    });
  });
}

var findFactMIs = (query) => {
  return new Promise((resolve, reject) => {
    FactMI.find(query)
      .exec((err, mis) => {
        if (err) reject(err);

        resolve(mis);
      });
  });
}

var i = {
  putFactMI: (req, res) => {
    try {
      var fm = {
        provider: req.body.id_provider,
        mi: req.body.id_mi,
        price: req.body.price
      }

      MIController.getMI({
          _id: fm.mi
        })
        .then((mi) => {
          if (mi.length == 0) {
            res.json({
              ok: 1,
              message: "Not found MI"
            });
            return
          }

          MIProviderController.getMIProvider({
            _id: fm.provider
          }).then((ps) => {
            if (ps.length == 0) {
              res.json({
                ok: 1,
                message: "Not found Provider"
              });
              return
            }

            saveFactMI(fm)
              .then((r) => {
                console.log(r);

                res.json({
                  ok: 1,
                  message: "FactMI added"
                });
              })
              .catch((err) => {
                throw err
              });
          })
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
  getFactMIs: (req, res) => {
    try {
      var provider = req.params.p;
      var query = {
        ID_MIProvider: provider
      }

      findFactMIs(query)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          });
        })
        .catch((err) => {
          winston.log('error', err);
          res.status(500).json({
            err: err.message
          });
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getFactMI: (req, res) => {
    try {
      var id = req.params.id;
      var query = {
        ID_MI: id
      }

      findFactMIs(query)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          });
        })
        .catch((err) => {
          winston.log('error', err);
          res.status(500).json({
            err: err.message
          });
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  }
}

module.exports = i
