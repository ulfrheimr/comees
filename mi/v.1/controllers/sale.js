var Sale = require('../models/sale');
// var Partial = require('../models/partial');
var Phys = require('../models/phys');
var PhysMi = require('./phys-mi');
const moment = require("moment");
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
  0: "No Discount",
  1: "Coupon",
  2: "RefMi"
}

var saleStatus = {
  1: "open",
  2: "closed",
  3: "invoiced"
}

var createSale = (sale) => {
  return new Promise((resolve, reject) => {
    var s = new Sale();

    s.timestamp = new Date();
    s.usr = sale.usr;
    s.payments = sale.payments.map((x) => {
      return {
        payment: x.payment,
        usr: sale.usr,
        timestamp: new Date(),
        paymentMethod: "PUE",
        paymentType: x.paymentType,
        paymentAccount: x.paymentAccount,
        auth: x.auth
      }
    })

    // NOT SUPPORTES STUFF
    // CLIENTS
    // s.client = ""
    s.client_name = ""

    //STATUS FOR PARTIAL
    s.status = 2

    // DISCOUNTS ON MIS
    s.mis = sale.mis.map((x) => {
      return {
        qty: x.qty,
        mi: x.mi,
        sale_price: x.salePrice,
        discount: 0,
        type_discount: 0,
        timestamp: new Date(),
        usr: sale.usr
      }
    })

    console.log(s);

    s.save((err, sale) => {
      if (err) reject(err)

      resolve(sale);
    });
  });
}

var findSales = (query) => {
  console.log("HHHH");
  return new Promise((resolve, reject) => {
    Sale.find(query)
      .exec((err, sales) => {
        if (err) reject(err);

        resolve(sales);
      });
  });
}


//
// var addMi = (product, id) => {
//   return new Promise((resolve, reject) => {
//     try {
//       var m = {
//         qty: product.qty,
//         mi: product.mi,
//         sale_price: product.price,
//         type_discount: product.type_discount,
//         discount: product.discount
//       }
//
//       Sale.update({
//           _id: id
//         }, {
//           $push: {
//             mis: m
//           }
//         }, {
//           upsert: true
//         },
//         (err, res) => {
//           if (err) reject(err);
//
//           if (res.ok != 1) {
//             message: "Product " + m.mi + " can't be added"
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
// // Partial Stuff
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
//           .map((p) => p.payments)
//           .reduce((x, y) => x.concat(y), [])
//           .filter((p) => moment(p.timestamp).isBetween(init_date, end_date))
//
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
//     p.mis = [];
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
// var addPartialMi = (mi, id) => {
//   return new Promise((resolve, reject) => {
//     try {
//       var m = {
//         qty: mi.qty,
//         mi: mi.mi
//       }
//
//       Partial.update({
//           _id: id
//         }, {
//           $push: {
//             mis: m
//           }
//         }, {
//           upsert: true
//         },
//         (err, res) => {
//           console.log(err);
//           if (err) reject(err);
//
//           if (res.ok != 1) {
//             message: "Product " + m.mi + " can't be added"
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
// var findPartials = (query) => {
//   return new Promise((resolve, reject) => {
//     Partial.find(query)
//       .populate('mis.mi')
//       .exec((err, partials) => {
//         if (err) reject(err);
//
//         resolve(partials);
//       });
//   });
// }
//
// var addPayment = (id, payment, usr) => {
//   return new Promise((resolve, reject) => {
//     try {
//       var p = {
//         payment: payment,
//         usr: usr,
//         timestamp: new Date()
//       }
//
//       Partial.update({
//           _id: id
//         }, {
//           $push: {
//             payments: p
//           }
//         }, {
//           upsert: true
//         },
//         (err, res) => {
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
//
// var closePartial = (partial_id, sale_id) => {
//   return new Promise((resolve, reject) => {
//     try {
//       Partial.update({
//           _id: partial_id
//         }, {
//           open: false,
//           sale_id: sale_id,
//           from_partial: true
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

Promise.all([
  // createSale
]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var i = {
  putSale: (req, res) => {
    try {
      // usr, paymentType, paymentAccount, auth
      var usr = req.body.usr;
      var payments = req.body.payments;
      var mis = req.body.mis;

      payments.forEach((x) => {
        if (PaymentTypes[x.paymentType] == null)
          throw {
            message: "Payment type not allowed"
          };
      })


      createSale({
          usr: usr,
          payments: payments,
          mis: mis
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
  getSales: (req, res) => {
    try {
      var init = moment(req.query.init)
      var end = req.query.end || moment()
      var usrId = req.query.usr

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
  // addPartialMi: (req, res) => {
  //   try {
  //     var mi = {
  //       qty: req.body.qty,
  //       mi: req.body.mi
  //     };
  //
  //     addPartialMi(mi, req.body.id_sale)
  //       .then((addedMi) => {
  //         res.json({
  //           ok: 1,
  //           data: addedMi
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
  // getPartial: (req, res) => {
  //   try {
  //     var client = req.query.client || "";
  //     var open = req.query.open || true;
  //
  //     var init = req.query.init;
  //
  //     var query = {
  //       'client_name': {
  //         $regex: ".*" + client + ".*",
  //         $options: 'i'
  //       },
  //       'open': open
  //     }
  //
  //     console.log(query);
  //     if (init) {
  //
  //     }
  //     console.log(query);
  //
  //     findPartials(query)
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
  // addMis: (req, res) => {
  //   try {
  //     var mi = {
  //       id_sale: req.body.id_sale,
  //       qty: req.body.qty,
  //       mi: req.body.mi,
  //       price: req.body.sale_price,
  //       type_discount: req.body.type_discount,
  //       discount: req.body.discount
  //     };
  //
  //     if (TypesDiscount[mi.type_discount] == null)
  //       throw {
  //         message: "Not allowed form of discount"
  //       }
  //
  //     if (mi.type_discount == 2) {
  //       PhysMi.addPhysMi({
  //           id: mi.discount,
  //           by: "code"
  //         }, {
  //           mi: mi.mi,
  //           price: mi.price
  //         })
  //         .then((pmi) => {
  //           if (!pmi)
  //             throw {
  //               message: "PMI not found"
  //             }
  //
  //           addMi(mi, mi.id_sale)
  //             .then((addedMi) => {
  //               res.json({
  //                 ok: 1,
  //                 data: addedMi
  //               })
  //             })
  //             .catch((err) => {
  //               throw err;
  //             });
  //         })
  //         .catch((err) => {
  //           throw err;
  //         })
  //     } else {
  //       addMi(mi, mi.id_sale)
  //         .then((addedMi) => {
  //           res.json({
  //             ok: 1,
  //             data: addedMi
  //           })
  //         })
  //         .catch((err) => {
  //           throw err;
  //         });
  //     }
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
  //
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
  // closePartial: (req, res) => {
  //   try {
  //     var sale_id = req.params.saleId;
  //     var partial_id = req.params.partialId;
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
