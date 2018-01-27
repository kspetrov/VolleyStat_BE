"use strict";

//Коннект к БД и с ним связанное

var logger = require('../log');

var promise = require('bluebird'); // or any other Promise/A+ compatible library;
promise.config({
  // Disable all warnings.
  warnings: false
});

var options = {
  promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

module.exports = {
  getCsv: function(array){
    if (array.length == 0){
      return -1; //возыращаем несуществующий ИД для пустого массива, иначе запрос к БД свалится с ошибкой
    }
    return pgp.as.csv(array)
  },
  getDb: function(){
    logger.info('***Get access to DB!***');
    return pgp('postgres://bgbjvcerobzspj:11ef1fd0788fef84d2ac2660ca6507c7cfe72c820a36163cfa6eab665c1c75f1@ec2-54-217-214-201.eu-west-1.compute.amazonaws.com:5432/daechdbff7270c?ssl=true')
  },
  closeDb: function(){
    logger.info('***Close DB!***');
    pgp.end()
  }
}
