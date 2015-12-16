"use strict";

//API v1 для работы с играми

var dbHelper = require('./db.js');
var check = require('./check.js');

module.exports = {

  //выборка игр по команде (параметр в запросе)
  getGames: function (req, res) {

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    if (!req.query.team) {
      return res.status(400).json({error: 'need team param'});
    }

    if (isNaN(req.query.team)) {
      return res.status(400).json({error: 'team param must be a number'});
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select id, name, "setWe", "setThey", "isEnd" from game where team = $1', req.query.team)
      .then(function (games) {
        res.json(games);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  },

  //выборка игры по Id
  getGameById: function (req, res) {

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select game.id, game.name, game.team as "teamId", team.name as "teamName", game."setWe", game."setThey", game."isEnd" ' +
              'from game, team where team.id = game.team and game.id = $1', req.params.id)
      .then(function (game) {
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
        res.json(game);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  }
}
