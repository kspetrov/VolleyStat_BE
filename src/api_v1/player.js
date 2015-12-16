"use strict";

//API v1 для работы с игроками

var dbHelper = require('./db.js');
var check = require('./check.js');

module.exports = {

  //выборка игроков по команде (параметр в запросе)
  getPlayers: function (req, res) {

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

    db.query('select id, num, name from player where team = $1', req.query.team)
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

  //выборка игрока по Id
  getPlayerById: function (req, res) {

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select player.id, player.name, player.num, player.team as "teamId", team.name as "teamName" ' +
              'from player, team where team.id = player.team and player.id = $1', req.params.id)
      .then(function (player) {
        res.json(player[0]);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  },

  //выборка игроков основы по сету(параметры в запросе - set and notMain)
  getLineUp: function (req, res) {

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    if (!req.query.set) {
      return res.status(400).json({error: 'need set param'});
    }

    if (isNaN(req.query.set)) {
      return res.status(400).json({error: 'set param must be a number'});
    }

    //Connect to DB
    var db = dbHelper.getDb();

    if (req.query.notMain !== undefined) {
      db.query('select player.id, player.name, player.num from lineup, player where lineup.player = player.id and lineup."isMain" = FALSE and lineup.set = $1', req.query.set)
        .then(function (lineUp) {
          res.json(lineUp);
        })
        .catch(function (error) {
          return res.status(503).json({error: error.toString()});
        })
        .finally(function () {
          dbHelper.closeDb();
        });
    }
    else {
      db.query('select player.id, player.name, player.num from lineup, player where lineup.player = player.id and lineup."isMain" = TRUE and lineup.set = $1', req.query.set)
        .then(function (lineUp) {
          res.json(lineUp);
        })
        .catch(function (error) {
          return res.status(503).json({error: error.toString()});
        })
        .finally(function () {
          dbHelper.closeDb();
        });
    }
  }
}
