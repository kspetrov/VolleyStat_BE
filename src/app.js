"use strict";

var express = require('express');

var app = express();
app.use(require('connect-livereload')());

var config = {
    port: 3000
};

var team = require('./api_v1/team.js');
app.get('/api/v1/teams', team.getTeams); //выборка всех команд
app.get('/api/v1/team/:id', team.getTeamById); //выборка команды по Id

var game = require('./api_v1/game.js');
app.get('/api/v1/games', game.getGames); //выборка игр по команде (параметр в запросе)
app.get('/api/v1/game/:id', game.getGameById); //выборка игры по Id

var player = require('./api_v1/player.js');
app.get('/api/v1/players', player.getPlayers); //выборка игроков по команде (параметр в запросе)
app.get('/api/v1/player/:id', player.getPlayerById); //выборка игрока по Id
app.get('/api/v1/lineup', player.getLineUp); //выборка игроков основы по сету(параметры в запросе)

var set = require('./api_v1/set.js');
app.get('/api/v1/sets', set.getSets); //выборка сетов по игре (параметр в запросе)
app.get('/api/v1/set/:id', set.getSetById); //выборка сета по Id

var stat = require('./api_v1/stat.js');
app.get('/api/v1/stat', stat.getStat); //выборка статистики по сету (параметр в запросе)


var server = app.listen(config.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})
