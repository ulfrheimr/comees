var Partial = require('../models/partial');
var Sale = require('../models/sale');
var winston = require('winston');

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

// Partial payment
var findPartials = (query) => {
  return new Promise((resolve, reject) => {
    Partial.find(query)
      .populate('mcs.mc')
      .exec((err, partials) => {
        if (err) reject(err);

        resolve(partials);
      });
  });
}

var createPartial = (partial) => {
  return new Promise((resolve, reject) => {
    var p = new Partial();

    p.client = partial.client;
    p.client_name = partial.client_name;
    p.mcs = [];
    p.payments = [];
    p.open = true;

    p.save((err, res) => {
      if (err) reject(err)

      resolve(res);
    });
  });
}

var addPayment = (id, payment) => {
  return new Promise((resolve, reject) => {
    try {
      var p = {
        payment: payment,
        timestamp: new Date()
      }

      Partial.update({
          _id: id
        }, {
          $push: {
            payments: p
          }
        }, {
          upsert: true
        },
        (err, res) => {
          if (err) reject(err);

          if (res.ok != 1) {
            message: "Payment can't be registered"
          };

          resolve(res.ok);
        });
    } catch (err) {
      reject(err);
    }
  });
}

var closePartial = (partial_id, sale_id) => {
  return new Promise((resolve, reject) => {
    try {

      Partial.update({
          _id: partial_id
        }, {
          open: false,
          sale_id: sale_id
        },
        (err, res) => {
          console.log(res);
          if (err) reject(err);

          if (res.ok != 1) {
            message: "Payment can't be registered"
          };

          resolve(res.ok);
        });
    } catch (err) {
      reject(err);
    }
  });
}

// Sale
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

var findSales = (query) => {
  return new Promise((resolve, reject) => {
    Sale.find(query)
      .populate('mcs')
      .populate('mcs.mc')
      .exec((err, sales) => {
        if (err) reject(err);

        resolve(sales);
      });
  });
}

var addMc = (product, id) => {
  return new Promise((resolve, reject) => {
    try {
      var m = {
        qty: product.qty,
        mc: product.mc,
        phys: product.phys,
        sale_price: product.sale_price,
        observations: product.observations
      }

      console.log(m);

      Sale.update({
          _id: id
        }, {
          $push: {
            mcs: m
          }
        }, {
          upsert: true
        },
        (err, res) => {
          console.log(res);
          if (err) reject(err);

          if (res.ok != 1) {
            message: "Product " + m.mc + " can't be added"
          };

          resolve(res.ok);
        });
    } catch (err) {
      reject(err);
    }
  });
}

var addPartialMc = (mc, id) => {
  return new Promise((resolve, reject) => {
    try {
      var m = {
        qty: mc.qty,
        mc: mc.mc,
        phys: mc.phys,
        sale_price: mc.sale_price,
        observations: mc.observations
      }

      Partial.update({
          _id: id
        }, {
          $push: {
            mcs: m
          }
        }, {
          upsert: true
        },
        (err, res) => {
          console.log(res);
          if (err) reject(err);

          if (res.ok != 1) {
            message: "Product " + m.mc + " can't be added"
          };

          resolve(res.ok);
        });
    } catch (err) {
      reject(err);
    }
  });
}

var i = {
  closePartial: (req, res) => {
    try {
      var sale_id = req.params.saleId;
      var partial_id = req.params.partialId;

      console.log(partial_id);

      closePartial(partial_id, sale_id)
        .then((r) => {
          console.log(r);
          res.json({
            ok: 1
          })
        })
        .catch((err) => {
          throw err;
        })

    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  putPartial: (req, res) => {
    try {
      var data = {
        client: req.body.client,
        client_name: req.body.client_name
      }


      createPartial(data)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          })
        })
        .catch((err) => {
          throw err;
        })
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  addPartialMc: (req, res) => {
    try {
      var mc = {
        qty: req.body.qty,
        mc: req.body.mc,
        phys: req.body.phys,
        sale_price: req.body.sale_price,
        observations: req.body.observations
      };

      addPartialMc(mc, req.body.id_sale)
        .then((addedMc) => {
          res.json({
            ok: 1,
            data: addedMc
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
  addPayment: (req, res) => {
    try {
      addPayment(req.body.id_sale, req.body.payment)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          })
        })
        .catch((err) => {
          throw err;
        })
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getPartial: (req, res) => {
    try {
      var client = req.query.client;
      var open = req.query.open || true;

      var query = {
        'client_name': {
          $regex: ".*" + client + ".*",
          $options: 'i'
        },
        'open': open
      }

      findPartials(query)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          })
        })
        .catch((err) => {
          throw err;
        })
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  addMcs: (req, res) => {
    try {
      var mc = {
        qty: req.body.qty,
        mc: req.body.mc,
        sale_price: req.body.sale_price,
        phys: req.body.phys,
        observations: req.body.observations
      };

      addMc(mc, req.body.id_sale)
        .then((addedMc) => {
          res.json({
            ok: 1,
            data: addedMc
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


      findSales({})
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
  putSale: (req, res) => {
    // usr, paymentType, paymentAccount, auth
    try {
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
  }
}

module.exports = i;
