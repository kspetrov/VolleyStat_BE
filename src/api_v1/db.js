"use strict";

//Коннект к БД и объект pgp

var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
  promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

module.exports = {
  getDb: function(){
    var cn = {
      host: 'ec2-54-247-170-228.eu-west-1.compute.amazonaws.com',
      port: 5432,
      database: 'd5r0j00appbnpg',
      user: 'pidnlbyteuwlfh',
      password: '5dgGUUWlr-vi_wX9_OJOlld8cP',
      ssl: true
    };
    return pgp(cn)
  },
  closeDb: function(){
    pgp.end()
  }
}
