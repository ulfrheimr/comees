var MC = require('../models/mc');
const winston = require('winston');

var saveMC = (mc) => {
  return new Promise((resolve, reject) => {
    var m = new MC();

    m.name = mc.name;
    m.suggested_price = mc.price;
    m.category = mc.catId;
    m.description = mc.desc;
    m.save((err, mcs) => {
      if (err) reject(err);

      resolve(mcs);
    });
  });
}
//
// var modifyMI = (mi) => {
//   return new Promise((resolve, reject) => {
//     console.log(mi);
//     MI.findOneAndUpdate({
//       _id: mi._id
//     }, {
//       name: mi.name,
//       price: mi.price,
//       description: mi.description,
//       category: mi.category,
//       delivery_time: mi.delivery_time,
//       sample: mi.sample
//     }, {
//       upsert: true
//     }, function(err, m) {
//       if (err) reject(err);
//       return resolve(m);
//     });
//   });
// }
//
var findMCs = (query) => {
  return new Promise((resolve, reject) => {
    MC.find(query)
      .populate('category')
      .exec((err, mis) => {
        if (err) reject(err);

        resolve(mis);
      });
  });
}

Promise.all([saveMC, findMCs]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var s = {
  putMC: (req, res) => {
    try {
      saveMC({
          name: req.body.name,
          desc: req.body.desc,
          catId: req.body.catId,
          price: req.body.price
        })
        .then((r) => {
          console.log(r);
          res.json({
            ok: 1,
            message: "MC added"
          });
        })
        .catch((err) => {
          throw err;

        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      })
    }
  },
  // modifyMI: (req, res) => {
  //   try {
  //     var mi = {
  //       _id: req.params.mi,
  //       name: req.body.name,
  //       price: req.body.price,
  //       description: req.body.desc,
  //       category: req.body.catId,
  //       delivery_time: req.body.delivery,
  //       sample: req.body.sample
  //     }
  //     modifyMI(mi)
  //       .then((r) => {
  //         res.json({
  //           ok: 1,
  //           data: r
  //         });
  //       })
  //       .catch((err) => {
  //         throw err
  //       });
  //   } catch (err) {
  //     winston.log('error', err);
  //     res.status(500).json({
  //       err: err.message
  //     });
  //   }
  // },
  getMCs: (req, res) => {
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

      findMCs(query)
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
  getMc: (req, res) => {
    try {

      var id = req.params.id

      var query = {
        _id: id
      }
      console.log(query);

      findMCs(query)
        .then((r) => {
          res.json({
            ok: 1,
            data: r[0]
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
};

module.exports = s;
