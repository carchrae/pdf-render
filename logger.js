'use strict';
var fs = require('fs');

var opts = {
  format: [
    '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})', //default format
    {
      error: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}' // error format
    }
  ],
  dateformat: 'yyyy-mm-d HH:MM:ss.L',
  preprocess: function (data) {
    data.title = data.title.toUpperCase();
  }
};

if (process.env.LOG_LEVEL) {
  opts.level = process.env.LOG_LEVEL.toLowerCase();
}

var logfile = process.env.LOG_FILE;
if (logfile) {
  console.log('sending node server log to file : ' + logfile);
  var shownError = false;
  opts.transport = function (data) {
    fs.appendFile(logfile, data.output + '\n', function (err) {
      if (err) {
        if (!shownError) {
          shownError = true;
          console.error('failed to write to log file ' + logfile + ' : ' + err);
        }
        console.log(data.output);
      }
    });
  };

  opts.transport({output: '\n\n\n\nnew log ' + new Date().toUTCString()});
}

var logger = require('tracer').colorConsole(opts);

module.exports = logger;
