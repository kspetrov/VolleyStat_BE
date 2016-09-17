"use strict";

//Проверки запросов, хеадеры Accept и Content-type

var logger = require('../log');

module.exports = {
  checkHeader: function(req){
    logger.info('***CheckHeader!***');

    var res = {error: null};
    if (req.get('Accept') !== 'application/json') {
      res.error = 'Accept header not application/json = ' + req.get('Accept');
      logger.error("Error when check request header:", res.error);
      return res;
    }
    //Комментим, потому что пока не разобраться с передачей хеадера "Content-type": "application/json" через fetch передается undefined потому что передать можно не все подряд.
    // if (req.get('Content-type') !== 'application/json'){
    //   res.error = 'Content-type header not application/json = ' + req.get('Content-type');
    //   logger.error("Error when check request header:", res.error);
    //   return res;
    // }

    logger.info('***CheckHeader OK!***');
    return res;
  }
}
