"use strict";

//API v1 для работы со статистикой

var dbHelper = require('./db.js');
var check = require('./check.js');
var logger = require('../log');

module.exports = {

  //выборка статистики по сету (параметр в запросе)
  getStat: function (req, res) {

    logger.info('***Get stat by set***');
    logger.info('Incoming data:', JSON.stringify(req.query));

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    if (!req.query.set ) {
      logger.error("Error, no set found in params");
      return res.status(400).json({error: 'need set param'});
    }

    if (isNaN(req.query.set)) {
      logger.error("Error, set in params must be a number");
      return res.status(400).json({error: 'set param must be a number'});
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select stat.id, player.id as "playerId", player.name, player.num, stat.action, stat."scoreWe", stat."scoreThey", stat.rotation, stat.serve, stat."inRally" ' +
              'from stat, player where player.id = stat.player and set = $1', req.query.set)
      .then(function (stat) {
        logger.info('Get stat by set result:', JSON.stringify(stat));
        logger.info('***Get stat by set OK!***');
        res.json(stat);
      })
      .catch(function (error) {
        logger.error('Get stat by set error:', JSON.stringify(error));
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  }
}
