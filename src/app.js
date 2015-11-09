"use strict";

var express = require('express');
var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

var app = express();
app.use(require('connect-livereload')());

//require('./team_api_v1/team.js')

var config = {
    port: 3000,
    conString: 'postgres://dccfcrnj:o10inFoPNTlE2qJYpvL080hi3Olj-b6q@pellefant.db.elephantsql.com:5432/dccfcrnj'
};

//выборка всех команд
app.get('/api/v1/teams', function (req, res) {

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
});

//выборка команды по Id
app.get('/api/v1/team/:id', function (req, res) {

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
});

//выборка игр по команде (параметр в запросе)
app.get('/api/v1/games', function (req, res) {

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
});

//выборка игры по Id
app.get('/api/v1/game/:id', function (req, res) {

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
});

//выборка игроков по команде (параметр в запросе)
app.get('/api/v1/players', function (req, res) {

  if (!req.query.team) {
    return res.status(400).json({error: 'need team param'});
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
});

//выборка игрока по Id
app.get('/api/v1/player/:id', function (req, res) {

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
});

//выборка сетов по игре (параметр в запросе)
app.get('/api/v1/sets', function (req, res) {

  if (!req.query.game ) {
    return res.status(400).json({error: 'need game param'});
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
});

//выборка сета по Id
app.get('/api/v1/set/:id', function (req, res) {

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
});

//выборка игроков основы по сету(параметры в запросе)
app.get('/api/v1/lineup', function (req, res) {

  if (!req.query.set) {
    return res.status(400).json({error: 'need set param'});
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
});

//выборка статистики по сету (параметр в запросе)
app.get('/api/v1/stat', function (req, res) {

  if (!req.query.set ) {
    return res.status(400).json({error: 'need set param'});
  }

  //Connect to DB
  var db = pgp(config.conString);

  db.query('select stat.id, player.id as "playerId", player.name, player.num, stat.action, stat."scoreWe", stat."scoreThey", stat.rotation, stat.serve, stat."inRally" ' +
            'from stat, player where player.id = stat.player and set = $1', req.query.set)
    .then(function (stat) {
      res.json(stat);
    })
    .catch(function (error) {
      return res.status(503).json({error: error.toString()});
    })
    .finally(function () {
      pgp.end();
    });
});


var server = app.listen(config.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})
