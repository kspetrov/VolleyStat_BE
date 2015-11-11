"use strict";

//API v1 для работы с игроками

var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

var config = {
    conString: 'postgres://dccfcrnj:o10inFoPNTlE2qJYpvL080hi3Olj-b6q@pellefant.db.elephantsql.com:5432/dccfcrnj'
};

module.exports = {

  //выборка игроков по команде (параметр в запросе)
  getPlayers: function (req, res) {

    if (!req.query.team) {
      return res.status(400).json({error: 'need team param'});
    }

    if (isNaN(req.query.team)) {
      return res.status(400).json({error: 'team param must be a number'});
    }

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select id, num, name from player where team = $1', req.query.team)
      .then(function (games) {
        res.json(games);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        pgp.end();
      });
  },

  //выборка игрока по Id
  getPlayerById: function (req, res) {

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select player.id, player.name, player.num, player.team as "teamId", team.name as "teamName" ' +
              'from player, team where team.id = player.team and player.id = $1', req.params.id)
      .then(function (player) {
        res.json(player[0]);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        pgp.end();
      });
  },

  //выборка игроков основы по сету(параметры в запросе)
  getLineUp: function (req, res) {

    if (!req.query.set) {
      return res.status(400).json({error: 'need set param'});
    }

    if (isNaN(req.query.set)) {
      return res.status(400).json({error: 'set param must be a number'});
    }

    //Connect to DB
    var db = pgp(config.conString);

    if (req.query.notMain !== undefined) {
      db.query('select player.id, player.name, player.num from lineup, player where lineup.player = player.id and lineup."isMain" = FALSE and lineup.set = $1', req.query.set)
        .then(function (lineUp) {
          res.json(lineUp);
        })
        .catch(function (error) {
          return res.status(503).json({error: error.toString()});
        })
        .finally(function () {
          pgp.end();
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
          pgp.end();
        });
    }
  }
}
