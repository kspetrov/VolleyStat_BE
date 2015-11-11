"use strict";

//API v1 для работы с сетами

var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

var config = {
    conString: 'postgres://dccfcrnj:o10inFoPNTlE2qJYpvL080hi3Olj-b6q@pellefant.db.elephantsql.com:5432/dccfcrnj'
};

module.exports = {

  //выборка сетов по игре (параметр в запросе)
  getSets: function (req, res) {

    if (!req.query.game ) {
      return res.status(400).json({error: 'need game param'});
    }

    if (isNaN(req.query.game)) {
      return res.status(400).json({error: 'game param must be a number'});
    }

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select id, "setNum", "startRotation", "startServe", "isEnd" from set where game = $1', req.query.game)
      .then(function (sets) {
        res.json(sets);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        pgp.end();
      });
  },

  //выборка сета по Id
  getSetById: function (req, res) {

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select set.id, set."setNum", set."startRotation", set."startServe", set."isEnd", set.game as "gameId", game.name as "gameName", team.id as "teamId", team.name as "teamName" ' +
              'from set, game, team where set.game = game.id and game.team = team.id and set.id = $1', req.params.id)
      .then(function (set) {
        return set[0];
      })
      .then(function (set) {
        return db.query('select player.id, player.name, player.num from lineup, player where lineup.player = player.id and lineup."isMain" = TRUE and lineup.set = $1', set.id)
                  .then(function (players) {
                    set.lineUp = players;
                    return set;
                  });
      })
      .then(function (set) {
        res.json(set);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        pgp.end();
      });
  }
}
