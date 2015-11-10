"use strict";

//API v1 для работы с играми

var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

var config = {
    conString: 'postgres://dccfcrnj:o10inFoPNTlE2qJYpvL080hi3Olj-b6q@pellefant.db.elephantsql.com:5432/dccfcrnj'
};

module.exports = {

  //выборка игр по команде (параметр в запросе)
  getGames: function (req, res) {

    if (!req.query.team) {
      return res.status(400).json({error: 'need team param'});
    }

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select id, name, "setWe", "setThey", "isEnd" from game where team = $1', req.query.team)
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

  //выборка игры по Id
  getGameById: function (req, res) {

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select game.id, game.name, game.team as "teamId", team.name as "teamName", game."setWe", game."setThey", game."isEnd" ' +
              'from game, team where team.id = game.team and game.id = $1', req.params.id)
      .then(function (game) {
        return game[0];
      })
      .then(function (game) {
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
        pgp.end();
      });
  }
}
