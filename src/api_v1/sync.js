"use strict";

//API v1 для работы с синхронизацией данных

var dbHelper = require('./db');
var check = require('./check');
var logger = require('../log');

module.exports = {

  //передача данных всех по команде (JSON объект с данными в запросе)
  syncDBByTeam: function (req, res) {

    logger.info("***Syncronization by team!***");
    logger.info('Incoming data:', JSON.stringify(req.body));

    var headerErr = check.checkHeader(req);
    if (headerErr.error != null) {
      logger.error("Error when check request header:", JSON.stringify(headerErr));
      return res.status(400).json(headerErr);
    }

    //TODO проверка валидности переданного JSON

    //Connect to DB
    var db = dbHelper.getDb();

    logger.info('Prepare object team with all data');
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
      .then(function (team) { // тут есть объект team, в котором необходимая инфа из БД, чтоб все очистить по ИД команды
        logger.info('Object team with all data:', JSON.stringify(team));
        var queries = function (index) { // составляем последовательность запросов
          switch (index) {
            //sequence queries for delete
            case 0:
              logger.info('Delete lineUp by sets [%s]', dbHelper.getCsv(team.sets));
              return this.query("delete from lineUp where set in ($1^)", dbHelper.getCsv(team.sets));
            case 1:
              logger.info('Delete stat by sets [%s]', dbHelper.getCsv(team.sets));
              return this.query("delete from stat where set in ($1^)", dbHelper.getCsv(team.sets));
            case 2:
              logger.info('Delete sets [%s]', dbHelper.getCsv(team.sets));
              return this.query("delete from set where id in ($1^)", dbHelper.getCsv(team.sets));
            case 3:
              logger.info('Delete games [%s]', dbHelper.getCsv(team.games));
              return this.query("delete from game where id in ($1^)", dbHelper.getCsv(team.games));
            case 4:
              logger.info('Delete players in team = ', team.id);
              return this.query("delete from player where team = $1", team.id);
            case 5:
              logger.info('Delete team = ', team.id);
              return this.query("delete from team where id = $1", team.id);

            //sequence queries for create
            case 6:
              logger.info('Create team, id = %d, name = %s', req.body.teamId, req.body.teamName);
              return this.query("insert into team(id, name) values($1, $2)", [req.body.teamId, req.body.teamName]);
          }

          var cnt = 7;

          if (req.body.teamPlayers != undefined){
            if (index <= cnt + req.body.teamPlayers.length - 1) {
              logger.info('Create player:', req.body.teamPlayers[index - cnt]);
              return this.query('insert into player(id, team, num, name) values(${id}, ${team}, ${num}, ${name})', req.body.teamPlayers[index - cnt]);
            }

            cnt = cnt + req.body.teamPlayers.length;
          }

          if (req.body.teamGames != undefined){
            if (index <= cnt + req.body.teamGames.length - 1) {
              logger.info('Create game:', req.body.teamGames[index - cnt]);
              return this.query('insert into game(id, team, name, "setWe", "setThey", "isEnd") ' +
                                'values(${id}, ${team}, ${name}, ${setWe}, ${setThey}, ${isEnd})', req.body.teamGames[index - cnt]);
            }

            cnt = cnt + req.body.teamGames.length;
          }

          if (req.body.teamSets != undefined){
            if (index <= cnt + req.body.teamSets.length - 1) {
              logger.info('Create set:', req.body.teamSets[index - cnt]);
              return this.query('insert into set(id, game, "setNum", "startRotation", "startServe", "isEnd") ' +
                                'values(${id}, ${game}, ${setNum}, ${startRotation}, ${startServe}, ${isEnd})', req.body.teamSets[index - cnt]);
            }

            cnt = cnt + req.body.teamSets.length;
          }

          if (req.body.teamLineUp != undefined){
            if (index <= cnt + req.body.teamLineUp.length - 1) {
              logger.info('Create lineUp:', req.body.teamLineUp[index - cnt]);
              return this.query('insert into lineUp(player, set, "isMain") values(${player}, ${set}, ${isMain})', req.body.teamLineUp[index - cnt]);
            }

            cnt = cnt + req.body.teamLineUp.length;
          }

          if (req.body.teamStat != undefined && index <= cnt + req.body.teamStat.length - 1) {
            logger.info('Create stat:', req.body.teamStat[index - cnt]);
            return this.query('insert into stat(id, set, player, action, "scoreWe", "scoreThey", rotation, serve, "inRally") ' +
                              'values(${id}, ${set}, ${player}, ${action}, ${scoreWe}, ${scoreThey}, ${rotation}, ${serve}, ${inRally})', req.body.teamStat[index - cnt]);
          }

        }

        return db.tx(function () {
          logger.info('Run sync queries');
          return this.sequence(queries); //run one by one in sequence
        })
      })
      .then(function (data) {
        logger.info('***Synchronization OK!***');
        return res.json();
      })
      .catch(function (error) {
        logger.error('Synchronisation error:', error.error);
        return res.status(503).json({error: error.error.toString()});
      })
      .finally(function () {
        dbHelper.closeDb();
      });
  }
}
