var PhysComission = require('./phys-comission');
var PhysMi = require('./phys-mi');
var Phys = require('../models/phys');
var Coupon = require('../models/coupon');
const winston = require('winston');

var saveCoupon = (c) => {
  return new Promise((resolve, reject) => {
    var coupon = new Coupon();
    coupon.code = c.code;
    coupon.init_date = c.init_date;
    coupon.end_date = c.end_date;
    coupon.discount = c.discount;
    coupon.description = c.description;

    coupon.save((err, r) => {
      if (err) reject(err);

      resolve(r);
    });
  });
}

var findCoupon = (query) => {
  return new Promise((resolve, reject) => {
    Coupon.find(query)
      .exec((err, cs) => {
        if (err) reject(err);

        resolve(cs);
      });
  });
}

Promise.all([saveCoupon, findCoupon]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var i = {
  putCoupon: (req, res) => {
    try {
      var a = {
        code: req.body.code,
        init_date: req.body.init_date,
        end_date: req.body.end_date,
        discount: req.body.discount,
        description: req.body.description,
      }

      saveCoupon({
          code: req.body.code,
          init_date: req.body.init_date,
          end_date: req.body.end_date,
          discount: req.body.discount,
          description: req.body.description,
        })
        .then((r) => {
          res.json({
            ok: 1,
            message: "Coupon added"
          });
        }).catch((err) => {
          throw (err);
        });

    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getCoupon: (req, res) => {
    try {
      var id = req.params.code;

      console.log(id);

      findCoupon({
          code: id
        })
        .then((r) => {
          res.json({
            ok: 1,
            data: r
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
  getCurrentPhysDiscount: (req, res) => {
    try {
      var id = req.params.id;

      PhysMi.queryPhysMI({
          id: id
        })
        .then((physMis) => {
          console.log(physMis);
          res.json({
            ok: 1,
            discount: 10
          })
          // PhysComission.queryPhysComission({
          //     phys: id
          //   })
          //   .then((physCom) => {
          //     console.log();
          //
          //   })
          //   .catch((err) => {
          //     throw err;
          //   })
        })
        .catch((err) => {
          winston.log('error', err);
          res.status(500).json({
            err: err.message
          });
        })

    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  }
}

module.exports = i;
