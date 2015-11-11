"use strict";

//API v1 для работы со статистикой

var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

var config = {
    conString: 'postgres://dccfcrnj:o10inFoPNTlE2qJYpvL080hi3Olj-b6q@pellefant.db.elephantsql.com:5432/dccfcrnj'
};

module.exports = {

  //выборка статистики по сету (параметр в запросе)
  getStat: function (req, res) {

    if (!req.query.set ) {
      return res.status(400).json({error: 'need set param'});
    }

    if (isNaN(req.query.set)) {
      return res.status(400).json({error: 'set param must be a number'});
    }

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select stat.id, player.id as "playerId", player.name, player.num, stat.action, stat."scoreWe", stat."scoreThey", stat.rotation, stat.serve, stat."inRally" ' +
              'from stat, player where player.id = stat.player and set = $1', req.query.set)
      .then(function (stat) {
        res.json(stat);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        pgp.end();
      });
  }
}
