"use strict";

//API v1 для работы с командами

var dbHelper = require('./db.js');

module.exports = {

  //выборка всех команд
  getTeams: function (req, res) {

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select * from team')
      .then(function (teams) {
        res.json(teams);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  },

  //выборка команды по Id
  getTeamById: function (req, res) {

    //Connect to DB
    var db = dbHelper.getDb();

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
        dbHelper.closeDb();
      });
  }
}
