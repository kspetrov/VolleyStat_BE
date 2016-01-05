"use strict";

//API v1 для работы с командами

var dbHelper = require('./db.js');
var check = require('./check.js');
var logger = require('../log');

module.exports = {

  //выборка всех команд
  getTeams: function (req, res) {

    logger.info('***Get teams***');

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select * from team')
      .then(function (teams) {
        logger.info('Get teams result:', JSON.stringify(teams));
        logger.info('***Get teams OK!***');
        res.json(teams);
      })
      .catch(function (error) {
        logger.error('Get teams error:', JSON.stringify(error));
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  },

  //выборка команды по Id
  getTeamById: function (req, res) {

    logger.info('***Get team by Id***');
    logger.info('Incoming data:', JSON.stringify(req.params));

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select * from team where id = $1', req.params.id)
      .then(function (team) {
        logger.info('Get team result:', JSON.stringify(team[0]));
        return team[0];
      })
      .then(function (team) { // add games
        return db.query('select id, name, "setWe", "setThey", "isEnd" from game where team = $1', team.id)
                  .then(function (games) {
                    team.games = games;
                    return team;
                  });
      })
      .then(function (team) { // add players
        logger.info('Get team with games result:', JSON.stringify(team));
        return db.query('select id, num, name from player where team = $1', team.id)
                  .then(function (players) {
                    team.players = players;
                    return team;
                  });
      })
      .then(function (team) {
        logger.info('Get team with games and players result:', JSON.stringify(team));
        logger.info('***Get team by Id OK***');
        return res.json(team);
      })
      .catch(function (error) {
        logger.error('Get team by Id error:', JSON.stringify(error));
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  }
}
