var Sale = require('../models/sale');
var Phys = require('../models/phys');
var PhysMi = require('./phys-mi');
const winston = require('winston');

var PaymentTypes = {
  "01": "Efectivo",
  "02": "Cheque nominativo",
  "03": "Transferencia electrónica de fondos",
  "04": "Tarjeta de crédito",
  "05": "Monedero electrónico",
  "06": "Dinero electrónico",
  "08": "Vales de despensa",
  "12": "Dación en pago",
  "13": "Pago por subrogación",
  "14": "Pago por consignación",
  "15": "Condonación",
  "17": "Compensación",
  "23": "Novacion",
  "24": "Confusión",
  "25": "Remisión de deuda",
  "26": "Prescripción o caducidad",
  "27": "A satisfacción del acreedor",
  "28": "Tarjeta de débito",
  "29": "Tarjeta de servicios",
  "30": "Aplicación de anticipos",
  "99": "Por definir"
}

var TypesDiscount = {
  0: "Normal",
  1: "Coupon",
  2: "RefMi"
}

var findSales = (query) => {
  return new Promise((resolve, reject) => {
    Sale.find(query)
      .populate('mis.mi')
      .exec((err, sales) => {
        if (err) reject(err);

        resolve(sales);
      });
  });
}

var createSale = (usr) => {
  return new Promise((resolve, reject) => {
    var s = new Sale();

    s.timestamp = new Date();
    s.usr = usr.usr;
    s.paymentMethod = usr.paymentMethod;
    s.paymentType = usr.paymentType;
    s.paymentAccount = usr.paymentAccount;
    s.auth = usr.auth;

    s.save((err, sale) => {
      if (err) reject(err)

      resolve(sale);
    });
  });
}

var addMi = (product, id) => {
  return new Promise((resolve, reject) => {
    try {
      var m = {
        qty: product.qty,
        mi: product.mi,
        sale_price: product.price,
        type_discount: product.typetype_discount,
        discount: product.discount
      }

      Sale.update({
          _id: id
        }, {
          $push: {
            mis: m
          }
        }, {
          upsert: true
        },
        (err, res) => {
          if (err) reject(err);

          if (res.ok != 1) {
            message: "Product " + m.mi + " can't be added"
          };

          resolve(res.ok);
        });
    } catch (err) {
      reject(err);
    }
  });
}

Promise.all([createSale]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var i = {
  putSale: (req, res) => {
    try {
      // usr, paymentType, paymentAccount, auth
      var usr = req.body.usr;
      var paymentMethod = "PUE";
      var paymentType = req.body.paymentType;
      var paymentAccount = req.body.paymentAccount;
      var auth = req.body.auth;

      if (PaymentTypes[paymentType] == null)
        throw {
          message: "Payment type not allowed"
        };

      createSale({
          usr: usr,
          paymentMethod: paymentMethod,
          paymentType: paymentType,
          paymentAccount: paymentAccount,
          auth: auth
        })
        .then((sale) => {
          console.log(sale);
          res.json({
            ok: 1,
            data: sale
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
  addMis: (req, res) => {
    try {
      var mi = {
        id_sale: req.body.id_sale,
        qty: req.body.qty,
        mi: req.body.mi,
        price: req.body.sale_price,
        type_discount: req.body.type_discount,
        discount: req.body.discount
      };



      if (TypesDiscount[mi.type_discount] == null)
        throw {
          message: "Not allowed form of discount"
        }

      if (mi.type_discount == 2) {
        PhysMi.addPhysMi({
            id: mi.discount,
            by: "code"
          }, {
            mi: mi.mi,
            price: mi.price
          })
          .then((pmi) => {
            if (!pmi)
              throw {
                message: "PMI not found"
              }

            addMi(mi, mi.id_sale)
              .then((addedMi) => {
                res.json({
                  ok: 1,
                  data: addedMi
                })
              })
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            throw err;
          })
      } else {
        addMi(mi, mi.id_sale)
          .then((addedMi) => {
            res.json({
              ok: 1,
              data: addedMi
            })
          })
          .catch((err) => {
            throw err;
          });
      }

    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getSales: (req, res) => {
    try {
      var init = req.query.init;
      var end = req.query.end;
      var usrId = req.query.usr;

      var query = {
        $and: [{
            timestamp: {
              // min sec millis
              $gte: init
            }
          },
          {
            timestamp: {
              $lte: end
            }
          }
        ]
      }

      if (usrId)
        query["usr"] = usrId;


      findSales(query)
        .then((sales) => {
          res.json({
            ok: 1,
            data: sales
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
  getSale: (req, res) => {
    try {
      var id = req.params.id;

      findSales({
          _id: id
        })
        .then((sales) => {
          if (sales.length == 0) throw "No found sales";
          res.json({
            ok: 1,
            data: sales[0]
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
  getSaleById: (id) => {
    return new Promise((resolve, reject) => {
      try {
        findSales({
            _id: id
          })
          .then((sales) => {
            if (sales.length == 0) reject({
              message: "No found sales"
            });

            resolve({
              data: sales[0]
            })
          })
          .catch((err) => {
            throw err;
          });
      } catch (err) {
        winston.log('error', err);
        reject(err);
      }
    })

  }
}
module.exports = i;
