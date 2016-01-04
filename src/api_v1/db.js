"use strict";

//Коннект к БД и с ним связанное

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
    return pgp('postgres://pidnlbyteuwlfh:5dgGUUWlr-vi_wX9_OJOlld8cP@ec2-54-247-170-228.eu-west-1.compute.amazonaws.com:5432/d5r0j00appbnpg?ssl=true')
  },
  closeDb: function(){
    pgp.end()
  }
}
