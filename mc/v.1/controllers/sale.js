var Sale = require('../models/sale')
var winston = require('winston')
var moment = require('moment')

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

var saleStatus = {
  1: "open",
  2: "closed",
  3: "invoiced"
}
// Sale
var createSale = (sale) => {
  return new Promise((resolve, reject) => {

    var payments = sale.payments.map((x) => {
      x["paymentMethod"] = "PUE"
      x["timestamp"] = new Date()
      x["usr"] = sale.usr

      return x
    })

    var mcs = sale.mcs

    var s = new Sale()

    s.timestamp = new Date()
    s.usr = sale.usr
    s.status = sale.status
    s.mcs = mcs
    s.payments = payments
    if (sale.client)
      s.client = sale.client
    if (sale.client_name)
      s.client_name = sale.client_name


    s.save((err, sale) => {
      if (err) reject(err)

      resolve(sale);
    });
  });
}

var findSales = (query) => {
  return new Promise((resolve, reject) => {
    Sale.find(query)
      .exec((err, sales) => {
        if (err) reject(err);

        resolve(sales);
      });
  });
}

var addPayment = (payment, sale, close) => {
  return new Promise((resolve, reject) => {
    try {

      Sale.update({
          _id: sale
        }, {
          $push: {
            payments: payment
          },
          status: close == true ? 2 : 1
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
// Partial payment
// var findPartials = (query) => {
//   return new Promise((resolve, reject) => {
//     Partial.find(query)
//       .populate('mcs.mc')
//       .exec((err, partials) => {
//         if (err) reject(err);
//
//         resolve(partials);
//       });
//   });
// }
//
// var createPartial = (partial) => {
//   return new Promise((resolve, reject) => {
//     var p = new Partial();
//
//     p.client = partial.client;
//     p.client_name = partial.client_name;
//     p.mcs = [];
//     p.payments = [];
//     p.open = true;
//
//     p.save((err, res) => {
//       if (err) reject(err)
//
//       resolve(res);
//     });
//   });
// }
//
// var closePartial = (partial_id, sale_id) => {
//   return new Promise((resolve, reject) => {
//     try {
//
//       Partial.update({
//           _id: partial_id
//         }, {
//           open: false,
//           sale_id: sale_id
//         },
//         (err, res) => {
//           console.log(res);
//           if (err) reject(err);
//
//           if (res.ok != 1) {
//             message: "Payment can't be registered"
//           };
//
//           resolve(res.ok);
//         });
//     } catch (err) {
//       reject(err);
//     }
//   });
// }
// var addMc = (product, id) => {
//   return new Promise((resolve, reject) => {
//     try {
//       var m = {
//         qty: product.qty,
//         mc: product.mc,
//         phys: product.phys,
//         sale_price: product.sale_price,
//         observations: product.observations
//       }
//
//       console.log(m);
//
//       Sale.update({
//           _id: id
//         }, {
//           $push: {
//             mcs: m
//           }
//         }, {
//           upsert: true
//         },
//         (err, res) => {
//           console.log(res);
//           if (err) reject(err);
//
//           if (res.ok != 1) {
//             message: "Product " + m.mc + " can't be added"
//           };
//
//           resolve(res.ok);
//         });
//     } catch (err) {
//       reject(err);
//     }
//   });
// }
//
// var addPartialMc = (mc, id) => {
//   return new Promise((resolve, reject) => {
//     try {
//       var m = {
//         qty: mc.qty,
//         mc: mc.mc,
//         phys: mc.phys,
//         sale_price: mc.sale_price,
//         observations: mc.observations
//       }
//
//       Partial.update({
//           _id: id
//         }, {
//           $push: {
//             mcs: m
//           }
//         }, {
//           upsert: true
//         },
//         (err, res) => {
//           console.log(res);
//           if (err) reject(err);
//
//           if (res.ok != 1) {
//             message: "Product " + m.mc + " can't be added"
//           };
//
//           resolve(res.ok);
//         });
//     } catch (err) {
//       reject(err);
//     }
//   });
// }
//
// var getPartialsCut = (init_date, end_date, usr) => {
//   return new Promise((resolve, reject) => {
//     var query = {
//       open: true,
//       $and: [{
//           "payments.timestamp": {
//             // min sec millis
//             $gte: moment(init_date)
//           }
//         },
//         {
//           "payments.timestamp": {
//             $lte: moment(end_date)
//           }
//         }
//       ]
//     }
//
//     if (usr || usr != "")
//       query["payments.usr"] = usr
//
//     Partial.find(query)
//       .exec((err, partials) => {
//         if (err) reject(err);
//
//         partials = partials
//           .map((p) => {
//             var phys = p.mcs[0].phys
//             var payment_phys = p.payments.map((x) => {
//               return {
//                 payment: x["payment"],
//                 timestamp: x["timestamp"],
//                 _id: x["_id"],
//                 phys: phys
//               }
//             })
//
//             return payment_phys
//           })
//           .reduce((x, y) => x.concat(y), [])
//           .filter((p) => moment(p.timestamp).isBetween(init_date, end_date))
//
//
//         resolve(partials);
//       });
//   });
// }

var i = {
  putSale: (req, res) => {
    // usr, paymentType, paymentAccount, auth
    try {
      var usr = req.body.usr;
      var payments = req.body.payments;
      var mcs = req.body.mcs;

      payments.forEach((x) => {
        if (PaymentTypes[x.paymentType] == null)
          throw {
            message: "Payment type not allowed"
          };
      })

      mcs = mcs.map((x) => {
        return {
          qty: x.qty,
          mc: x.mc,
          phys: x.phys,
          sale_price: x.salePrice,
          timestamp: new Date(),
          usr: usr
        }
      })

      createSale({
          usr: usr,
          status: 2,
          payments: payments,
          mcs: mcs
        })
        .then((sale) => {
          res.json({
            ok: 1,
            data: sale._id
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
  putPartial: (req, res) => {
    // usr, paymentType, paymentAccount, auth
    try {
      var usr = req.body.usr
      var payments = req.body.payments
      var mcs = req.body.mcs
      var client = req.body.client
      var clientName = req.body.client_name

      mcs = mcs.map((x) => {
        return {
          qty: x.qty,
          mc: x.mc,
          phys: x.phys,
          sale_price: x.salePrice,
          timestamp: new Date(),
          usr: usr
        }
      })

      createSale({
          usr: usr,
          status: 1,
          payments: payments,
          mcs: mcs,
          client: client,
          client_name: clientName
        })
        .then((sale) => {

          res.json({
            ok: 1,
            data: sale._id
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
  getPartial: (req, res) => {
    try {
      var client = req.query.client || "";

      var query = {
        'client_name': {
          $regex: ".*" + client + ".*",
          $options: 'i'
        },
        status: 1
      }

      findSales(query)
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
  addPartialToSale: (req, res) => {
    try {
      var sale = req.body.sale
      var usr = req.body.usr
      var payment = req.body.payment
      var close = req.body.close

      payment["usr"] = usr
      payment["timestamp"] = new Date()

      addPayment(payment, sale, close)
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
  getSales: (req, res) => {
    try {
      var init = moment(req.query.init)
      var end = req.query.end || moment()
      var usrId = req.query.usr;
      var from_partial = req.query.from_partial || false;

      var query = {
        $and: [{
            "payments.timestamp": {
              // min sec millis
              $gte: init
            }
          },
          {
            "payments.timestamp": {
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

  // closePartial: (req, res) => {
  //   try {
  //     var sale_id = req.params.saleId;
  //     var partial_id = req.params.partialId;
  //
  //     console.log(partial_id);
  //
  //     closePartial(partial_id, sale_id)
  //       .then((r) => {
  //         console.log(r);
  //         res.json({
  //           ok: 1
  //         })
  //       })
  //       .catch((err) => {
  //         throw err;
  //       })
  //
  //   } catch (err) {
  //     winston.log('error', err);
  //     res.status(500).json({
  //       err: err.message
  //     });
  //   }
  // },
  // putPartial: (req, res) => {
  //   try {
  //     var data = {
  //       client: req.body.client,
  //       client_name: req.body.client_name
  //     }
  //
  //     createPartial(data)
  //       .then((r) => {
  //         res.json({
  //           ok: 1,
  //           data: r
  //         })
  //       })
  //       .catch((err) => {
  //         throw err;
  //       })
  //   } catch (err) {
  //     winston.log('error', err);
  //     res.status(500).json({
  //       err: err.message
  //     });
  //   }
  // },
  // addPartialMc: (req, res) => {
  //   try {
  //     var mc = {
  //       qty: req.body.qty,
  //       mc: req.body.mc,
  //       phys: req.body.phys,
  //       sale_price: req.body.sale_price,
  //       observations: req.body.observations
  //     };
  //
  //     addPartialMc(mc, req.body.id_sale)
  //       .then((addedMc) => {
  //         res.json({
  //           ok: 1,
  //           data: addedMc
  //         })
  //       })
  //       .catch((err) => {
  //         throw err;
  //       });
  //
  //   } catch (err) {
  //     winston.log('error', err);
  //     res.status(500).json({
  //       err: err.message
  //     });
  //   }
  // },
  // addPayment: (req, res) => {
  //   try {
  //     var usr = req.body.usr
  //     if (!usr || usr == "")
  //       throw {
  //         message: "Usr must be specified"
  //       };
  //
  //     addPayment(req.body.id_sale, req.body.payment, usr)
  //       .then((r) => {
  //         res.json({
  //           ok: 1,
  //           data: r
  //         })
  //       })
  //       .catch((err) => {
  //         throw err;
  //       })
  //   } catch (err) {
  //     winston.log('error', err);
  //     res.status(500).json({
  //       err: err.message
  //     });
  //   }
  // },


  // addMcs: (req, res) => {
  //   try {
  //     var mc = {
  //       qty: req.body.qty,
  //       mc: req.body.mc,
  //       sale_price: req.body.sale_price,
  //       phys: req.body.phys,
  //       observations: req.body.observations
  //     };
  //
  //     addMc(mc, req.body.id_sale)
  //       .then((addedMc) => {
  //         res.json({
  //           ok: 1,
  //           data: addedMc
  //         })
  //       })
  //       .catch((err) => {
  //         throw err;
  //       });
  //
  //   } catch (err) {
  //     winston.log('error', err);
  //     res.status(500).json({
  //       err: err.message
  //     });
  //   }
  // },
  // getSaleById: (id) => {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       findSales({
  //           _id: id
  //         })
  //         .then((sales) => {
  //           if (sales.length == 0) reject({
  //             message: "No found sales"
  //           });
  //
  //           resolve({
  //             data: sales[0]
  //           })
  //         })
  //         .catch((err) => {
  //           throw err;
  //         });
  //     } catch (err) {
  //       winston.log('error', err);
  //       reject(err);
  //     }
  //   })
  // },
  // partialsCut: (req, res) => {
  //   try {
  //
  //     var init_date = req.query.init_date;
  //     var end_date = req.query.end_date || moment();
  //     var usr = req.query.usr;
  //
  //     if (!init_date || !moment(init_date).isValid()) {
  //       throw {
  //         message: "Init date must be specified"
  //       };
  //     }
  //
  //     init_date = moment(init_date)
  //
  //     if (!moment(end_date).isValid()) {
  //       throw {
  //         message: "End date must be specified"
  //       };
  //     }
  //
  //     getPartialsCut(init_date, end_date, usr)
  //       .then((r) => {
  //
  //         res.json({
  //           ok: 1,
  //           data: r
  //         })
  //       })
  //       .catch((err) => {
  //         throw err;
  //       })
  //
  //   } catch (err) {
  //     winston.log('error', err);
  //     res.status(500).json({
  //       err: err.message
  //     });
  //   }
  // }
}

module.exports = i;
