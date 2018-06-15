var MIProvider = require('../models/mi-provider');
const winston = require('winston');

var saveMIProvider = (provider) => {
  return new Promise((resolve, reject) => {
    var p = new MIProvider();

    p.name = provider.name;

    p.save((err, ps) => {
      if (err) reject(err);

      resolve(ps);
    });
  });
}

var findMIProviders = (query) => {
  return new Promise((resolve, reject) => {
    MIProvider.find(query)
      .exec((err, provs) => {
        if (err) reject(err);

        resolve(provs);
      });
  });
}

var i = {
  putMIProvider: (req, res) => {
    try {
      var name = req.body.name

      var provider = {
        name: name
      }

      saveMIProvider(provider)
        .then((r) => {
          res.json({
            ok: 1,
            message: "MIProvider added",
            data: r
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
  getMIProviders: (req, res) => {
    try {
      findMIProviders({})
        .then((r) => {
          res.json({
            ok: 1,
            data: r
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
  getMIProvider: (provider) => {
    try {
      var query = {
        _id: provider._id
      }
      console.log(query);
      return findMIProviders(query)
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  }

}

module.exports = i;
