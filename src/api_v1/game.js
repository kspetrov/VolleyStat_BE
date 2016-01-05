"use strict";

//API v1 для работы с играми

var dbHelper = require('./db');
var check = require('./check');
var logger = require('../log');

module.exports = {

  //выборка игр по команде (параметр в запросе)
  getGames: function (req, res) {
    logger.info('***Get games by team***');
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

    db.query('select id, name, "setWe", "setThey", "isEnd" from game where team = $1', req.query.team)
      .then(function (games) {
        logger.info('Get games result:', JSON.stringify(games));
        logger.info('***Get games by team OK!***');
        res.json(games);
      })
      .catch(function (error) {
        logger.error('Get games by team error:', JSON.stringify(error));
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  },

  //выборка игры по Id
  getGameById: function (req, res) {

    logger.info('***Get game by Id***');
    logger.info('Incoming data:', JSON.stringify(req.params));

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select game.id, game.name, game.team as "teamId", team.name as "teamName", game."setWe", game."setThey", game."isEnd" ' +
              'from game, team where team.id = game.team and game.id = $1', req.params.id)
      .then(function (game) {
        logger.info('Get game result:', JSON.stringify(game));
        return game[0];
      })
      .then(function (game) { // add sets
        return db.query('select id, "setNum", "startRotation", "startServe", "isEnd" from set where game = $1', game.id)
                  .then(function (sets) {
                    game.sets = sets;
                    return game;
                  });
      })
      .then(function (game) {
        logger.info('Get game result with sets:', JSON.stringify(game));
        logger.info('***Get game by Id OK***');
        res.json(game);
      })
      .catch(function (error) {
        logger.error('Get game by Id error:', JSON.stringify(error));
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  }
}
