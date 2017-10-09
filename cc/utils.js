var winston = require('winston');
var config = require('./config');


winston.add(winston.transports.File, {
  filename: config.id_log + '.log'
});

var w = {

}

module.exports = w;
