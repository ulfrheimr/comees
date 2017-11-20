var http = require('http');
var querystring = require('querystring');
var config = require('./config').srvr;
var poor = require('./config').span_for_poor_servers;
var capitalize = require('capitalize');

var getIntervalPost = () => {
  return Math.random() * 1000 * poor;
}
var i = {
  putCat: (c) => {
    return new Promise((resolve, reject) => {
      var cat = querystring.stringify({
        name: c
      });

      var opts = {
        host: config.mi.address,
        port: config.mi.port,
        path: '/cats',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(cat)
        }
      };

      var request = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          d = JSON.parse(d).data

          resolve(d)
        });
      });

      request.write(cat);
      request.end();
    });
  },
  getCats: () => {
    return new Promise((resolve, reject) => {
      http.get({
        hostname: config.mi.address,
        port: config.mi.port,
        path: '/cats',
        agent: false // create a new agent just for this one request
      }, (res) => {
        res.on('data', function(data) {
          var cats = {}
          data = JSON.parse(data)["data"];

          data = data.map((item) => {
            if (item["name"] in cats)
              console.log("Repeted cat why");
            else
              cats[item["name"].toLowerCase()] = item["_id"]
          });

          resolve(cats);
        });
      });
    });
  },
  putMi: (m) => {
    return new Promise((resolve, reject) => {
      setTimeout(function() {
        var mi = querystring.stringify({
          name: capitalize.words(m.name),
          catId: m.cat,
          price: m.price,
          desc: capitalize.words(m.desc),
          delivery: m.delivery,
          sample: capitalize.words(m.sample)
        });

        var opts = {
          host: config.mi.address,
          port: config.mi.port,
          path: '/mis',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(mi)
          }
        };

        var request = http.request(opts, function(res) {
          res.setEncoding('utf8');
          res.on('data', function(d) {
            d = JSON.parse(d);
            resolve(d)
          });
        });

        request.write(mi);
        request.end();
      }, getIntervalPost());
    });
  }
};

module.exports = i;
