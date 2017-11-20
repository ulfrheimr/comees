var http = require('http');
var querystring = require('querystring');

var config = require('./config');

var i = {
  putPress: (p) => {
    return new Promise((resolve, reject) => {
      var pres = querystring.stringify({
        presentation: p
      });

      var opts = {
        host: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/press',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(pres)
        }
      };

      var request = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          d = JSON.parse(d).data

          resolve(d)
        });
      });

      request.write(pres);
      request.end();
    });
  },
  getPress: () => {
    return new Promise((resolve, reject) => {
      http.get({
        hostname: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/press',
        agent: false // create a new agent just for this one request
      }, (res) => {
        res.on('data', function(data) {
          var press = {}
          data = JSON.parse(data)["data"];

          data = data.map((item) => {
            if (item["presentation"] in press)
              console.log("Repeted pres why");
            else
              press[item["presentation"]] = item["_id"]
          });

          resolve(press);
        });
      });

    });
  },
  putLab: (l) => {
    return new Promise((resolve, reject) => {
      var lab = querystring.stringify({
        lab: l
      });

      var opts = {
        host: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/labs',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(lab)
        }
      };

      var request = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          d = JSON.parse(d).data
          resolve(d)
        });
      });

      request.write(lab);
      request.end();
    });
  },
  getLabs: () => {
    return new Promise((resolve, reject) => {
      http.get({
        hostname: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/labs',
        agent: false // create a new agent just for this one request
      }, (res) => {
        res.on('data', function(data) {
          var labs = {}
          data = JSON.parse(data)["data"];

          data = data.map((item) => {
            if (item["lab"] in labs)
              console.log("Repeted lab why");
            else
              labs[item["lab"]] = item["_id"]
          });

          resolve(labs);
        });
      });
    });
  },
  putDrug: (drug) => {
    return new Promise((resolve, reject) => {
      // code, name, substance, id_presentation, dosage, qty,
      // id_lab, sale_price, max_price, cat, ssa, desc

      var d = querystring.stringify({
        code: drug.code,
        name: drug.name,
        substance: drug.substance,
        id_presentation: drug.id_presentation,
        dosage: drug.dosage,
        qty: drug.qty,
        id_lab: drug.id_lab,
        sale_price: drug.sale_price,
        max_price: drug.max_price,
        cat: drug.cat,
        ssa: drug.ssa,
        desc: drug.desc,
        follow: drug.follow,
      });

      var opts = {
        host: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/drugs',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(d)
        }
      };

      var request = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          d = JSON.parse(d).data
          resolve(d)
        });
      });

      request.write(d);
      request.end();
    });
  },
  getStock: (drug) => {

    return new Promise((resolve, reject) => {
      var req = http.get({
        hostname: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/stock/' + drug.code,
        agent: false // create a new agent just for this one request
      }, (res) => {
        res.on('data', (data) => {
            var d;
            if (("" + res.statusCode).match(/^2\d\d$/)) {
              d = JSON.parse(data).data;

              resolve({
                id: d.drug['_id'],
                code: d.drug['code']
              });
            } else if (("" + res.statusCode).match(/^5\d\d$/)) {
              i.putDrug(drug)
                .then((d) => {

                  resolve({
                    id: d['_id'],
                    code: d['code']
                  });
                })
                .catch((err) => {
                  console.log("Err");
                  console.log(drug);
                  throw new Error(err.message)
                });
            }
          })
          .on('error', (err) => {
            reject("Got an err");
          })
      });
      req.on('error', (err) => {
        reject("err");
      });
    });
  },
  getBuyPlace: (buy_place) => {
    return new Promise((resolve, reject) => {
      http.get({
        hostname: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/buy_places',
        agent: false // create a new agent just for this one request
      }, (res) => {
        res.on('data', function(data) {
          var places = {}
          data = JSON.parse(data)["data"];

          data = data.map((item) => {
            if (item["place"] == buy_place)
              places[item["place"]] = item["_id"]
          });

          if (Object.keys(places).length == 0) {
            i.putBuyPlace(buy_place)
              .then((bp) => {
                resolve({
                  id: bp["_id"]
                })
              })
              .catch((err) => console.log(err));
          } else
            resolve({
              id: places[buy_place]
            });

        });
      });

    });
  },
  putBuyPlace: (buy_place) => {
    return new Promise((resolve, reject) => {
      var place = querystring.stringify({
        place: buy_place
      });

      var opts = {
        host: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/buy_places',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(place)
        }
      };

      var request = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          d = JSON.parse(d).data

          resolve(d)
        });
      });

      request.write(place);
      request.end();
    });
  },
  createPurchase: (buy_place) => {
    return new Promise((resolve, reject) => {
      var place = querystring.stringify({
        buy_place: buy_place
      });

      var opts = {
        host: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/purchases',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(place)
        }
      };

      var request = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          console.log(d);
          d = JSON.parse(d).data

          resolve({
            id: d["_id"]
          })
        });
      });

      request.write(place);
      request.end();
    });
  },
  addDrug: (drug, purchase) => {
    return new Promise((resolve, reject) => {
      var purchasedDrug = querystring.stringify({
        id_purchase: purchase,
        qty: drug.qty,
        id_drug: drug.code,
        price: 0
      });

      var opts = {
        host: config.srvr.ph.address,
        port: config.srvr.ph.port,
        path: '/purchases',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(purchasedDrug)
        }
      };

      var request = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          if (d == "Stock isn't find for drug") {
            console.log("DRUG");
            console.log(drug);
            console.log("NOT IMPORTED PLEASE CHECK");
            reject(d);
            return
          }

          d = JSON.parse(d)

          resolve(d)
        });
      });

      request.write(purchasedDrug);
      request.end();
    });
  }
}

module.exports = i;
