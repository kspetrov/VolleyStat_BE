"use strict";

//API v1 для работы с синхронизацией данных

var dbHelper = require('./db.js');
var check = require('./check.js');

module.exports = {

  //передача данных всех по команде (JSON объект с данными в запросе)
  syncDBByTeam: function (req, res) {

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      return res.status(400).json(headerErr);
    }

    //TODO проверка валидности переданного JSON

    //Connect to DB
    var db = dbHelper.getDb();

    db.query('select id from game where team = $1', req.body.teamId) //получаем игры по ИД команды
      .then(function (games) {
        var team = {};
        team.id = req.body.teamId;
        team.games = games.map(function(game){
          return game.id;
        });
        return team;
      })
      .then(function (team) {
        return db.query('select id from set where game in ($1^)', dbHelper.getCsv(team.games)) //получаем сеты по играм на предыдущем шаге
                  .then(function (sets) {
                    team.sets = sets.map(function(set){
                      return set.id;
                    });
                    return team;
                  });
      })
      .then(function (team) { // тут есть объект team, у котором необходимая инфа из БД, чтоб все очистить по ИД команды
        var queries = function (index) { // составляем последовательность запросов
          switch (index) {
            //sequence queries for delete
            case 0:
              return this.query("delete from lineUp where set in ($1^)", dbHelper.getCsv(team.sets));
            case 1:
              return this.query("delete from stat where set in ($1^)", dbHelper.getCsv(team.sets));
            case 2:
              return this.query("delete from set where id in ($1^)", dbHelper.getCsv(team.sets));
            case 3:
              return this.query("delete from game where id in ($1^)", dbHelper.getCsv(team.games));
            case 4:
              return this.query("delete from player where team = $1", team.id);
            case 5:
              return this.query("delete from team where id = $1", team.id);

            //sequence queries for create
            case 6:
              return this.query("insert into team(id, name) values($1, $2)", [req.body.teamId, req.body.teamName]);
          }

          var cnt = 7;

          if (index <= cnt + req.body.teamPlayers.length - 1) {
            return this.query('insert into player(id, team, num, name) values(${id}, ${team}, ${num}, ${name})', req.body.teamPlayers[index - cnt]);
          }

          cnt = cnt + req.body.teamPlayers.length;

          if (index <= cnt + req.body.teamGames.length - 1) {
            return this.query('insert into game(id, team, name, "setWe", "setThey", "isEnd") ' +
                              'values(${id}, ${team}, ${name}, ${setWe}, ${setThey}, ${isEnd})', req.body.teamGames[index - cnt]);
          }

          cnt = cnt + req.body.teamGames.length;

          if (index <= cnt + req.body.teamSets.length - 1) {
            return this.query('insert into set(id, game, "setNum", "startRotation", "startServe", "isEnd") ' +
                              'values(${id}, ${game}, ${setNum}, ${startRotation}, ${startServe}, ${isEnd})', req.body.teamSets[index - cnt]);
          }

          cnt = cnt + req.body.teamSets.length;

          if (index <= cnt + req.body.teamLineUp.length - 1) {
            return this.query('insert into lineUp(player, set, "isMain") values(${player}, ${set}, ${isMain})', req.body.teamLineUp[index - cnt]);
          }

          cnt = cnt + req.body.teamLineUp.length;

          if (index <= cnt + req.body.teamStat.length - 1) {
            return this.query('insert into stat(id, set, player, action, "scoreWe", "scoreThey", rotation, serve, "inRally") ' +
                              'values(${id}, ${set}, ${player}, ${action}, ${scoreWe}, ${scoreThey}, ${rotation}, ${serve}, ${inRally})', req.body.teamStat[index - cnt]);
          }

        }

        return db.tx(function () {
          return this.sequence(queries); //run one by one in sequence
        })
      })
      .then(function (data) {
        return res.json();
      })
      .catch(function (error) {
        console.log(error);
        return res.status(503).json({error: error.error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  }
}
