"use strict";

//Проверки запросов, хеадеры Accept и Content-type

module.exports = {
  checkHeader: function(req){
    var res = {error: null};
    if (req.get('Accept') !== 'application/json') {
      res.error = 'Accept header not application/json';
      return res;
    }
    if (req.get('Content-type') !== 'application/json'){
      res.error = 'Content-type header not application/json';
      return res;
    }

    return res;
  }
}
