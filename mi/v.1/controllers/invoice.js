var Invoice = require('../models/invoice');
var Client = require('../models/client');
var Sale = require('./sale');
const winston = require('winston');

var getLastInvoice = () => {
  return new Promise((resolve, reject) => {
    var query = {}

    query["$and"] = [{
      timestamp: {
        // min sec millis
        $lte: new Date()
      }
    }];

    Invoice.findOne(query)
      .sort({
        timestamp: -1
      })
      .exec((err, is) => {
        if (err)
          reject(err)

        resolve(is);
      });
  });


}

var saveInvoice = (invoice) => {
  return new Promise((resolve, reject) => {
    var i = new Invoice();

    i.client = invoice.client;
    i.sale = invoice.sale;
    i.timestamp = new Date();
    i.is_invoiced = false;

    findInvoices({
        sale: i.sale,
        client: i.client
      })
      .then((invoices) => {
        if (invoices.length > 0) throw {
          message: "Already invoiced"
        }

        getLastInvoice()
          .then((li) => {

            if (li == null) {
              li = {};
            }
            var next = 1;
            var currentYear = new Date().getFullYear();
            var serial = "F-" + currentYear + "-" + next;

            if (li["serial"]) {
              var lastInvoiceYear = new Date(li["timestamp"]).getFullYear();

              if (currentYear == lastInvoiceYear) {
                var current = parseInt(li["serial"].split("-")[2])
                next = current + 1;
                serial = "F-" + lastInvoiceYear + "-" + next;
              }
            }
            i["serial"] = serial;

            i.save((err, invoice) => {
              if (err) reject(err);

              resolve(invoice);
            });
          })
          .catch((err) => {
            reject(err)
          })

      })
      .catch((err) => {
        reject(err)
      });

  });
}

var markAsInvoiced = (invoice) => {
  return new Promise((resolve, reject) => {
    Invoice.findOneAndUpdate({
      _id: invoice
    }, {
      is_invoiced: true
    }, {
      upsert: true
    }, function(err, i) {
      if (err) reject(err);

      console.log(i);
      return resolve(i);
    });
  });
}

var findInvoices = (query) => {
  return new Promise((resolve, reject) => {
    Invoice.find(query)
      .sort({
        timestamp: -1
      })
      .exec((err, is) => {
        if (err) reject(err);

        resolve(is);
      });
  });
}

Promise.all([saveInvoice]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var i = {
  putInvoice: (req, res) => {
    try {
      var id_client = req.body.id_client;
      var id_sale = req.body.id_sale;

      Client.getClient({
          id: id_client,
          by: "id"
        })
        .then(c => {
          c = c.data
          if (!c)
            throw {
              message: "Client not found"
            }

          Sale.getSaleById(id_sale)
            .then((s) => {
              saveInvoice({
                  client: id_client,
                  sale: id_sale
                })
                .then((i) => {
                  res.json({
                    ok: 1,
                    data: i
                  })
                })
                .catch((err) => {
                  winston.log('error', err);
                  res.status(500).json({
                    err: err.message
                  });
                });
            })
            .catch((err) => {
              winston.log('error', err);
              res.status(500).json({
                err: err.message
              });
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
  getInvoices: (req, res) => {
    var init = req.query.init || "";
    var end = req.query.end || "";
    var invoiced = req.query.invoiced || "";
    var client = req.query.client || "";

    var query = {}

    if (init != "" && end != "")
      query["$and"] = [{
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
      ];

    if (invoiced != "")
      query["is_invoiced"] = JSON.parse(invoiced);
    if (client != "")
      query["client"] = {
        $ne: null
      };

    findInvoices(query)
      .then(is => {
        res.json({
          ok: 1,
          data: is
        })
      })
      .catch((err) => res.status(500).send(err));
  },
  setAsInvoiced: (req, res) => {
    var id_invoice = req.body.invoice;

    markAsInvoiced(id_invoice)
      .then((i) => {
        res.json({
          ok: 1,
          data: i
        });
      })
      .catch((err) => res.status(500).send(err));
  }
}

module.exports = i;
