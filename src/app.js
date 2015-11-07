"use strict";

var express = require('express');
var pg = require('pg');

var app = express();

app.use(require('connect-livereload')());

var config = {
    port: 3000,
    conString: 'postgres://dccfcrnj:o10inFoPNTlE2qJYpvL080hi3Olj-b6q@pellefant.db.elephantsql.com:5432/dccfcrnj'
};

//выборка команд
app.get('/api/v1/teams', function (req, res) {

  //Connect to DB
  pg.connect(config.conString, function(err, client, done) {

    if (err) {
      return res.status(503).json({error: 'DB connection failed'});
    }
    //запрос команд
    client.query('select * from team', function(err, result) {
      done();
      if (err) {
        return res.status(503).json({error: 'error running query'});
      }
      res.json(result.rows);
    });

  });
});

//выборка игр по команде (параметр в запросе)
app.get('/api/v1/games', function (req, res) {

  //Connect to DB
  pg.connect(config.conString, function(err, client, done) {

    if (err) {
      return res.status(503).json({error: 'DB connection failed'});
    }

    if (!req.query.team) {
      return res.status(400).json({error: 'need team param'});
    }
    //запрос игр по команде
    client.query('select id, name, "setWe", "setThey", "isEnd" from game where team = $1',[req.query.team], function(err, result) {
      done();
      if (err) {
        return res.status(503).json({error: 'error running query, team param must be a number'});
      }
      res.json(result.rows);
    });

  });
});

//выборка игроков по команде (параметр в запросе)
app.get('/api/v1/players', function (req, res) {

  //Connect to DB
  pg.connect(config.conString, function(err, client, done) {

    if (err) {
      return res.status(503).json({error: 'DB connection failed'});
    }

    if (!req.query.team) {
      return res.status(400).json({error: 'need team param'});
    }
    //запрос игроков по команде
    client.query('select id, num, name from player where team = $1', [req.query.team], function(err, result) {
      done();
      if (err) {
        return res.status(503).json({error: 'error running query, team param must be a number'});
      }
      res.json(result.rows);
    });

  });
});

//выборка сетов по игре или команде (параметры в запросе)
app.get('/api/v1/sets', function (req, res) {

  //Connect to DB
  pg.connect(config.conString, function(err, client, done) {

    if (err) {
      return res.status(503).json({error: 'DB connection failed'});
    }

    if (!req.query.game && !req.query.team) {
      return res.status(400).json({error: 'need game or team param'});
    }
    //запрос сетов по игре если передана игра в качестве пераметра
    if (req.query.game){
      client.query('select id, "setNum", "startRotation", "startServe", "isEnd" from set where game = $1', [req.query.game], function(err, result) {
        done();
        if (err) {
          return res.status(503).json({error: 'error running query, game param must be a number'});
        }
        return res.json(result.rows);
      });
    }
    //запрос сетов в разрезе игр по команде
    client.query('select id from game where team = $1', [req.query.team], function(err, gameIds) {
      if (err) {
        return res.status(503).json({error: 'error running query, team param must be a number'});
      }

      var data = [];
      gameIds.rows.map(function (gameId){
        var gameData = {gameId: gameId.id};
        client.query('select id, "setNum", "startRotation", "startServe", "isEnd" from set where game = $1', [gameData.gameId], function(err, sets) {
          if (err) {
            return res.status(503).json({error: 'error running query'});
          }
          gameData.sets = sets.rows;
          data.push(gameData);
        });
      });
      console.log(data);
      done();
      res.json(data);
    });
  });
});

//выборка игроков основы по сету, по игре или в рамках команды (параметры в запросе)
app.get('/api/v1/lineup', function (req, res) {

  //Connect to DB
  pg.connect(config.conString, function(err, client, done) {

    if (err) {
      return res.status(503).json({error: 'DB connection failed'});
    }

    if (!req.query.set && !req.query.game && !req.query.team) {
      return res.status(400).json({error: 'need set or game or team param'});
    }

    if (req.query.game){
      client.query('select set, player from lineup where "isMain" = TRUE and set = ' + req.query.set, function(err, result) {
        done();
        if (err) {
          return res.status(503).json({error: 'error running query, set param must be a number'});
        }
        res.json(result.rows.map(function(el) { return el.player }));
      });
    }
    client.query('select player from lineup where "isMain" = TRUE and set = ' + req.query.set, function(err, result) {
      done();
      if (err) {
        return res.status(503).json({error: 'error running query, set param must be a number'});
      }
      res.json(result.rows.map(function(el) { return el.player }));
    });

  });
});

//выборка статистики основы по сету (параметр в запросе)
app.get('/api/v1/stat', function (req, res) {

  //Connect to DB
  pg.connect(config.conString, function(err, client, done) {

    if (err) {
      return res.status(503).json({error: 'DB connection failed'});
    }

    if (!req.query.set) {
      return res.status(400).json({error: 'need set param'});
    }
    client.query('select id, player, action, "scoreWe", "scoreThey", rotation, serve, "inRally" from stat where set = ' + req.query.set, function(err, result) {
      done();
      if (err) {
        return res.status(503).json({error: 'error running query, set param must be a number'});
      }
      res.json(result.rows);
    });

  });
});


var server = app.listen(config.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})
