"use strict";

//API v1 для работы с командами

var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

var config = {
    conString: 'postgres://dccfcrnj:o10inFoPNTlE2qJYpvL080hi3Olj-b6q@pellefant.db.elephantsql.com:5432/dccfcrnj'
};

module.exports = {

  //выборка всех команд
  getTeams: function (req, res) {

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select * from team')
      .then(function (teams) {
        res.json(teams);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        pgp.end();
      });
  },

  //выборка команды по Id
  getTeamById: function (req, res) {

    //Connect to DB
    var db = pgp(config.conString);

    db.query('select * from team where id = $1', req.params.id)
      .then(function (team) {
        return team[0];
      })
      .then(function (team) {
        return db.query('select id, name, "setWe", "setThey", "isEnd" from game where team = $1', team.id)
                  .then(function (games) {
                    team.games = games;
                    return team;
                  });
      })
      .then(function (team) {
        return db.query('select id, num, name from player where team = $1', team.id)
                  .then(function (players) {
                    team.players = players;
                    return team;
                  });
      })
      .then(function (team) {
        return res.json(team);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        pgp.end();
      });
  }
}
