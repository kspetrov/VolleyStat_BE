"use strict";

var winston = require('winston');
var path = require('path');

//create logger

var logger = new (winston.Logger)({
  transports: [
    new winston.transports.File({
      name: 'info-file',
      filename: path.join(path.dirname(require.main.filename), 'filelog-info.log'),
      level: 'info',
      maxsize: 5242880, //5MB
      maxFiles: 5,
      json: false
    }),
    new winston.transports.File({
      name: 'error-file',
      filename: path.join(path.dirname(require.main.filename), 'filelog-error.log'),
      level: 'error',
      maxsize: 5242880, //5MB
      maxFiles: 5,
      json: false
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exceptionHandlers: [
    new (winston.transports.File)({
      name: 'exception-file',
      filename: path.join(path.dirname(require.main.filename), 'filelog-exception.log'),
      level: 'error',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      maxsize: 5242880, //5MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});

module.exports = logger;
