var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');

var app = express();
var port = process.env.PORT || 3001;

mongoose.connect('mongodb://' + config.usr + ':' + config.pass + '@' + config.data + ':' + config.data_port + '/' + config.db_name);

// Here we have connection used locally without any security for dev purpsoses
// mongoose.connect('mongodb://' + config.data + ':' + config.data_port + '/' + config.db_name);

var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "origin, x-requested-with, content-type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");

  next();
}

app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', require('./v.1/routes'));

app.use(function(req, res, next) {
  var error = new Error("Not found");
  error.status = 404;
  error.message = "Not found resource";

  res.send(error);
  next();
});

app.set('port', port);

var server = app.listen(app.get('port'),
  () => {
    console.log("Running MI @" + server.address().port)
  });
