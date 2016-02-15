'use strict';


var express = require('express'),
  logger = require('./logger'),
  pdf = require('./pdf');


var app = express();

app.get('/', pdf);


var port = process.env.PORT || 4000;
app.listen(port, function (err, res) {
  if (err) {
    logger.error('failed', err);
  } else {
    logger.info('started listening on ', port);
  }
});
