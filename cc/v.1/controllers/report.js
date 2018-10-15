var http = require("http");
var https = require("https");
var config = require("../../config");




var i = {
  getMCReport: (query, callback, error) => {
    var options = {
      host: '212.237.23.239',
      port: 3003,
      path: '',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    var queryString = "/sales?init=" + query.init + "&end=" + query.end;
    var prot = http;

    options.path = queryString;
    var req = prot.request(options, function(res) {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        output += chunk;
      });

      res.on('end', function() {
        if (("" + res.statusCode).match(/^2\d\d$/)) {
          var obj = JSON.parse(output);

          callback(obj.data);
        } else if (("" + res.statusCode).match(/^5\d\d$/)) {
          console.log("EVERYTHING BAD");
          error("01")
        }
      });
    });

    req.on('error', function(err) {
      console.log("ERR");
      error(err)
    });

    req.end();
  },
  getMIReport: (query, callback, error) => {
    var options = {
      host: '212.237.23.239',
      port: 3001,
      path: '',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    var queryString = "/sales?init=" + query.init + "&end=" + query.end;
    var prot = http;

    options.path = queryString;
    var req = prot.request(options, function(res) {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        output += chunk;
      });

      res.on('end', function() {
        if (("" + res.statusCode).match(/^2\d\d$/)) {
          var obj = JSON.parse(output);

          callback(obj.data);
        } else if (("" + res.statusCode).match(/^5\d\d$/)) {
          console.log("EVERYTHING BAD");
          error("01")
        }
      });
    });

    req.on('error', function(err) {
      console.log("ERR");
      error(err)
    });

    req.end();
  },
}

module.exports = i
