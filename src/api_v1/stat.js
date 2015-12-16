"use strict";

//API v1 для работы со статистикой

var dbHelper = require('./db.js');
var check = require('./check.js');

module.exports = {

  //выборка статистики по сету (параметр в запросе)
  getStat: function (req, res) {

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    if (!req.query.set ) {
      return res.status(400).json({error: 'need set param'});
    }

    if (isNaN(req.query.set)) {
      return res.status(400).json({error: 'set param must be a number'});
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select stat.id, player.id as "playerId", player.name, player.num, stat.action, stat."scoreWe", stat."scoreThey", stat.rotation, stat.serve, stat."inRally" ' +
              'from stat, player where player.id = stat.player and set = $1', req.query.set)
      .then(function (stat) {
        res.json(stat);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  }
}
