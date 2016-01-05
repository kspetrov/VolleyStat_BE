"use strict";

//API v1 для работы с игроками

var dbHelper = require('./db');
var check = require('./check');
var logger = require('../log');

module.exports = {

  //выборка игроков по команде (параметр в запросе)
  getPlayers: function (req, res) {

    logger.info('***Get players by team***');
    logger.info('Incoming data:', JSON.stringify(req.query));

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    if (!req.query.team) {
      logger.error("Error, no team found in params");
      return res.status(400).json({error: 'need team param'});
    }

    if (isNaN(req.query.team)) {
      logger.error("Error, team in params must be a number");
      return res.status(400).json({error: 'team param must be a number'});
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select id, num, name from player where team = $1', req.query.team)
      .then(function (players) {
        logger.info('Get players by team result:', JSON.stringify(players));
        logger.info('***Get players by team OK!***');
        res.json(players);
      })
      .catch(function (error) {
        logger.error('Get players by team error:', JSON.stringify(error));
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  },

  //выборка игрока по Id
  getPlayerById: function (req, res) {

    logger.info('***Get player by Id***');
    logger.info('Incoming data:', JSON.stringify(req.params));

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select player.id, player.name, player.num, player.team as "teamId", team.name as "teamName" ' +
              'from player, team where team.id = player.team and player.id = $1', req.params.id)
      .then(function (player) {
        logger.info('Get player result:', JSON.stringify(player[0]));
        logger.info('***Get player by Id OK***');
        res.json(player[0]);
      })
      .catch(function (error) {
        logger.error('Get player by Id error:', JSON.stringify(error));
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  },

  //выборка игроков основы по сету(параметры в запросе - set and notMain)
  getLineUp: function (req, res) {

    logger.info('***Get lineUp by set***');
    logger.info('Incoming data:', JSON.stringify(req.query));


    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    if (!req.query.set) {
      logger.error("Error, no set found in params");
      return res.status(400).json({error: 'need set param'});
    }

    if (isNaN(req.query.set)) {
      logger.error("Error, set in params must be a number");
      return res.status(400).json({error: 'set param must be a number'});
    }

    //Connect to DB
    var db = dbHelper.getDb();

    if (req.query.notMain !== undefined) {
      db.query('select player.id, player.name, player.num from lineup, player where lineup.player = player.id and lineup."isMain" = FALSE and lineup.set = $1', req.query.set)
        .then(function (lineUp) {
          logger.info('Get lineUp by set, isMain=false result:', JSON.stringify(lineUp));
          logger.info('***Get lineUp by set OK!***');
          res.json(lineUp);
        })
        .catch(function (error) {
          logger.error('Get lineUp by set error:', JSON.stringify(error));
          return res.status(503).json({error: error.toString()});
        })
        .finally(function () {
          dbHelper.closeDb();
        });
    }
    else {
      db.query('select player.id, player.name, player.num from lineup, player where lineup.player = player.id and lineup."isMain" = TRUE and lineup.set = $1', req.query.set)
        .then(function (lineUp) {
          logger.info('Get lineUp by set, isMain=true result:', JSON.stringify(lineUp));
          logger.info('***Get lineUp by set OK!***');
          res.json(lineUp);
        })
        .catch(function (error) {
          logger.error('Get lineUp by set error:', JSON.stringify(error));
          return res.status(503).json({error: error.toString()});
        })
        .finally(function () {
          dbHelper.closeDb();
        });
    }
  }
}
