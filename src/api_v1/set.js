"use strict";

var dbHelper = require('./db.js');
var check = require('./check.js');

module.exports = {

  //выборка сетов по игре (параметр в запросе)
  getSets: function (req, res) {

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    if (!req.query.game ) {
      return res.status(400).json({error: 'need game param'});
    }

    if (isNaN(req.query.game)) {
      return res.status(400).json({error: 'game param must be a number'});
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select id, "setNum", "startRotation", "startServe", "isEnd" from set where game = $1', req.query.game)
      .then(function (sets) {
        res.json(sets);
      })
      .catch(function (error) {
        return res.status(503).json({error: error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  },

  //выборка сета по Id
  getSetById: function (req, res) {

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select set.id, set."setNum", set."startRotation", set."startServe", set."isEnd", set.game as "gameId", game.name as "gameName", team.id as "teamId", team.name as "teamName" ' +
              'from set, game, team where set.game = game.id and game.team = team.id and set.id = $1', req.params.id)
      .then(function (set) {
        return set[0];
      })
      .then(function (set) { // add lineUp
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
        dbHelper.closeDb();
      });
  }
}
