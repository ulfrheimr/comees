var MI = require('../models/mi');
const winston = require('winston');

var saveMI = (mi) => {
  return new Promise((resolve, reject) => {
    var m = new MI();

    m.name = mi.name;
    m.price = mi.price;
    m.description = mi.desc;
    m.category = mi.catId;
    m.delivery_time = mi.delivery;
    m.sample = mi.sample;

    m.save((err, mis) => {
      if (err) reject(err);

      resolve(mis);
    });
  });
}

var modifyMI = (mi) => {
  return new Promise((resolve, reject) => {
    console.log(mi);
    MI.findOneAndUpdate({
      _id: mi._id
    }, {
      name: mi.name,
      price: mi.price,
      description: mi.description,
      category: mi.category,
      delivery_time: mi.delivery_time,
      sample: mi.sample
    }, {
      upsert: true
    }, function(err, m) {
      if (err) reject(err);
      return resolve(m);
    });
  });
}

var findMIs = (query) => {
  return new Promise((resolve, reject) => {
    MI.find(query)
      .populate('category')
      .exec((err, mis) => {
        if (err) reject(err);

        resolve(mis);
      });
  });
}

Promise.all([saveMI, modifyMI, findMIs]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var s = {
  putMI: (req, res) => {
    saveMI({
        name: req.body.name,
        price: req.body.price,
        catId: req.body.catId,
        desc: req.body.desc,
        delivery: req.body.delivery,
        sample: req.body.sample
      })
      .then((r) => {
        console.log(r);
        res.json({
          ok: 1,
          message: "MI added"
        });
      })
      .catch((err) => res.status(500).send(err));
  },
  modifyMI: (req, res) => {
    try {
      var mi = {
        _id: req.params.mi,
        name: req.body.name,
        price: req.body.price,
        description: req.body.desc,
        category: req.body.catId,
        delivery_time: req.body.delivery,
        sample: req.body.sample
      }
      modifyMI(mi)
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
  getMIs: (req, res) => {
    try {
      var query = {};
      var name = req.query.name;

      if (name != null && name != "")
        query = {
          name: {
            $regex: ".*" + name + ".*",
            $options: 'i'
          }
        }

      findMIs(query)
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
  }
};

module.exports = s;
