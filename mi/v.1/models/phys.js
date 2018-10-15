var http = require("http");
var https = require("https");
var config = require("../../config");

var options = {
  host: 'localhost',
  port: 3000,
  path: '',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

var p = {
  getPhys: (query) => {

    var queryString = "/physs/" + query.id + "?by=" + query.by;
    var prot = http;

    options.path = queryString;
    return new Promise((resolve, reject) => {
      var req = prot.request(options, function(res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
          output += chunk;
        });

        res.on('end', function() {
          if (("" + res.statusCode).match(/^2\d\d$/)) {
            var obj = JSON.parse(output);
            resolve({
              status: res.statusCode,
              data: obj.data[0]
            });
          } else if (("" + res.statusCode).match(/^5\d\d$/)) {
            console.log("EVERYTHING BAD");
            reject("01:Not found phys")
          }
        });
      });

      req.on('error', function(err) {
        console.log("ERR");
        reject(err);
      });

      req.end();
    });
  }
}

module.exports = p;
