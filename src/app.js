"use strict";

var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var serve_static = require('serve-static');
var logger = require('./log')

var app = express();

//CORS middleware
//Разобраться с Access-Control .... их много, понять что к чему. Сейчас выставлено, что похрен откуда запрашивать - ответ будет отдаваться.
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);

app.use(bodyParser.json());
app.use(require('connect-livereload')());

//вывод хелпа по корневому пути
app.use(serve_static(path.join(path.dirname(require.main.filename), 'doc/')));

var team = require('./api_v1/team');
/**
 * @api {get} /api/v1/teams Получение всех команд
 * @apiVersion 1.0.0
 * @apiName GetTeams
 * @apiGroup Teams
 *
 * @apiDescription Выдает все существующие команды, по которым есть данные в БД
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/teams
 *
 * @apiSuccess {Object[]} teams       Список всех существующих команд (Array of Objects).
 * @apiSuccess {Integer}  teams.id    Идентификатор команды.
 * @apiSuccess {String}   teams.name  Имя команды.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{"id":1,"name":"Барсы"},{"id":2,"name":"ХЗ"}]
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/teams', team.getTeams); //выборка всех команд
/**
 * @api {get} /api/v1/team/:id Получение команды по идентификатору
 * @apiVersion 1.0.0
 * @apiName GetTeamById
 * @apiGroup Teams
 *
 * @apiDescription Выдает команду по ее идентификатору, но еще пристегивает игроков команды и игры команды
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/team/1
 *
 * @apiSuccess {Object}   team              Объект команды - JSON
 * @apiSuccess {Integer}  team.id           Идентификатор команды.
 * @apiSuccess {String}   team.name         Имя команды.
 * @apiSuccess {Object[]} team.games        Список всех игр команды (Array of Objects).
 * @apiSuccess {Integer}  team.game.id      Идентификатор игры.
 * @apiSuccess {String}   team.game.name    Имя игры.
 * @apiSuccess {Integer}  team.game.setWe   Количество выигранных сетов нами.
 * @apiSuccess {Integer}  team.game.setThey Количество выигранных сетов противником.
 * @apiSuccess {Boolean}  team.game.isEnd   Признак окончания игры.
 * @apiSuccess {Object[]} team.players      Список всех игроков команды (Array of Objects).
 * @apiSuccess {Integer}  team.player.id    Идентификатор игрока.
 * @apiSuccess {String}   team.player.name  Имя игрока.
 * @apiSuccess {Integer}  team.player.num   Номер игрока.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"id":1,"name":"Барсы","games":[{"id":1,"name":"qwe","setWe":1,"setThey":1,"isEnd":false},{"id":2,"name":"qqq","setWe":1,"setThey":3,"isEnd":true}],"players":[{"id":1,"num":1,"name":"Вася"},{"id":2,"num":2,"name":"Петя"},{"id":3,"num":3,"name":"Коля"}]}
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/team/:id', team.getTeamById); //выборка команды по Id

var game = require('./api_v1/game');
/**
 * @api {get} /api/v1/games Получение игр по команде
 * @apiVersion 1.0.0
 * @apiName GetGames
 * @apiGroup Games
 *
 * @apiDescription Выдает все игры указанной команды
 *
 * @apiParam {Integer} team Идентификатор команды
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/games?team=1
 *
 * @apiSuccess {Object[]} games         Список игр у запрошенной команды (Array of Objects).
 * @apiSuccess {Integer}  games.id      Идентификатор игры.
 * @apiSuccess {String}   games.name    Имя игры.
 * @apiSuccess {Integer}  games.setWe   Количество выигранных сетов нами.
 * @apiSuccess {Integer}  games.setThey Количество выигранных сетов противником.
 * @apiSuccess {Boolean}  games.isEnd   Признак окончания игры.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 * @apiError (Error 400) BadRequest Не указан параметр запроса или параметр не числовой.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{"id":1,"name":"qwe","setWe":1,"setThey":1,"isEnd":false},{"id":2,"name":"qqq","setWe":1,"setThey":3,"isEnd":true}]
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/games', game.getGames); //выборка игр по команде (параметр в запросе)
/**
 * @api {get} /api/v1/game/:id Получение игры по идентификатору
 * @apiVersion 1.0.0
 * @apiName GetGameById
 * @apiGroup Games
 *
 * @apiDescription Выдает игру по ее идентификатору, но еще пристегивает сеты и команду к которой относится игра
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/game/1
 *
 * @apiSuccess {Object}   game                    Объект игры - JSON
 * @apiSuccess {Integer}  game.id                 Идентификатор игры.
 * @apiSuccess {String}   game.name               Имя игры.
 * @apiSuccess {Integer}  game.teamId             Идентификатор команды.
 * @apiSuccess {String}   game.teamName           Имя команды.
 * @apiSuccess {Integer}  game.setWe              Количество выигранных сетов нами.
 * @apiSuccess {Integer}  game.setThey            Количество выигранных сетов противником.
 * @apiSuccess {Boolean}  game.isEnd              Признак окончания игры.
 * @apiSuccess {Object[]} game.sets               Список всех сетов игры (Array of Objects).
 * @apiSuccess {Integer}  game.sets.id            Идентификатор сета.
 * @apiSuccess {String}   game.sets.setNum        Номер сета.
 * @apiSuccess {Integer}  game.sets.startRotation Начальная расстановка в сете.
 * @apiSuccess {Boolean}  game.sets.startServe    Начальная подача в сете (0-Мы, 1-Противник).
 * @apiSuccess {Boolean}  game.sets.isEnd         Признак окончания сета.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"id":1,"name":"Барсы","games":[{"id":1,"name":"qwe","setWe":1,"setThey":1,"isEnd":false},{"id":2,"name":"qqq","setWe":1,"setThey":3,"isEnd":true}],"players":[{"id":1,"num":1,"name":"Вася"},{"id":2,"num":2,"name":"Петя"},{"id":3,"num":3,"name":"Коля"}]}
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/game/:id', game.getGameById); //выборка игры по Id

var player = require('./api_v1/player');
/**
 * @api {get} /api/v1/players Получение игроков по команде
 * @apiVersion 1.0.0
 * @apiName GetPlayers
 * @apiGroup Players
 *
 * @apiDescription Выдает всех игроков указанной команды
 *
 * @apiParam {Integer} team Идентификатор команды
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/players?team=1
 *
 * @apiSuccess {Object[]} players       Список игроков у запрошенной команды (Array of Objects).
 * @apiSuccess {Integer}  players.id    Идентификатор игрока.
 * @apiSuccess {String}   players.name  Имя игрока.
 * @apiSuccess {Integer}  players.num   Номер игрока.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 * @apiError (Error 400) BadRequest Не указан параметр запроса или параметр не числовой.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{"id":1,"num":1,"name":"Вася"},{"id":2,"num":2,"name":"Петя"},{"id":3,"num":3,"name":"Коля"}]
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/players', player.getPlayers); //выборка игроков по команде (параметр в запросе)
/**
 * @api {get} /api/v1/player/:id Получение игрока по идентификатору
 * @apiVersion 1.0.0
 * @apiName GetPlayerById
 * @apiGroup Players
 *
 * @apiDescription Выдает игрока по его идентификатору, но еще пристегивает сеты и команду к которой относится игра
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/player/1
 *
 * @apiSuccess {Object}   player          Объект игрока - JSON
 * @apiSuccess {Integer}  player.id       Идентификатор игрока.
 * @apiSuccess {String}   player.name     Имя игрока.
 * @apiSuccess {Integer}  player.num      Номер игрока.
 * @apiSuccess {Integer}  player.teamId   Идентификатор команды.
 * @apiSuccess {String}   player.teamName Имя команды.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"id":1,"name":"Вася","num":1,"teamId":1,"teamName":"Барсы"}
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/player/:id', player.getPlayerById); //выборка игрока по Id
/**
 * @api {get} /api/v1/lineup Получение игроков основы на сет
 * @apiVersion 1.0.0
 * @apiName GetLineUp
 * @apiGroup Players
 *
 * @apiDescription Выдает игроков основы или запаса на сет
 *
 * @apiParam {Integer} set     Идентификатор сета
 * @apiParam {Boolean} notMain=false Признак основы или запаса, можно не указывать
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/lineup?set=1
 *
 * @apiSuccess {Object[]} lineup       Список игроков основы или запаса по сету (Array of Objects).
 * @apiSuccess {Integer}  lineup.id    Идентификатор игрока.
 * @apiSuccess {String}   lineup.name  Имя игрока.
 * @apiSuccess {Integer}  lineup.num   Номер игрока.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 * @apiError (Error 400) BadRequest Не указан параметр set запроса или параметр не числовой.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{"id":1,"num":1,"name":"Вася"},{"id":2,"num":2,"name":"Петя"},{"id":3,"num":3,"name":"Коля"}]
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/lineup', player.getLineUp); //выборка игроков основы по сету(параметры в запросе)

var set = require('./api_v1/set');
/**
 * @api {get} /api/v1/sets Получение сетов по игре
 * @apiVersion 1.0.0
 * @apiName GetSets
 * @apiGroup Sets
 *
 * @apiDescription Выдает все сеты указанной игры
 *
 * @apiParam {Integer} game Идентификатор игры
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/sets?game=1
 *
 * @apiSuccess {Object[]} sets               Список сетов у запрошенной игры (Array of Objects).
 * @apiSuccess {Integer}  sets.id            Идентификатор сета.
 * @apiSuccess {String}   sets.setNum        Номер сета.
 * @apiSuccess {Integer}  sets.startRotation Начальная расстановка в сете.
 * @apiSuccess {Boolean}  sets.startServe    Начальная подача в сете (0-Мы, 1-Противник).
 * @apiSuccess {Boolean}  sets.isEnd         Признак окончания сета.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 * @apiError (Error 400) BadRequest Не указан параметр запроса или параметр не числовой.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{"id":1,"setNum":2,"startRotation":5,"startServe":false,"isEnd":false},{"id":2,"setNum":3,"startRotation":5,"startServe":false,"isEnd":false}]
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/sets', set.getSets); //выборка сетов по игре (параметр в запросе)
/**
 * @api {get} /api/v1/set/:id Получение сета по идентификатору
 * @apiVersion 1.0.0
 * @apiName GetSetById
 * @apiGroup Sets
 *
 * @apiDescription Выдает сет по его идентификатору, но еще пристегивает основной состав на сет
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/set/1
 *
 * @apiSuccess {Object}   set               Объект сета - JSON
 * @apiSuccess {Integer}  set.id            Идентификатор сета.
 * @apiSuccess {String}   set.setNum        Номер сета.
 * @apiSuccess {Integer}  set.startRotation Начальная расстановка в сете.
 * @apiSuccess {Boolean}  set.startServe    Начальная подача в сете (0-Мы, 1-Противник).
 * @apiSuccess {Boolean}  set.isEnd         Признак окончания сета.
 * @apiSuccess {Integer}  set.gameId        Идентификатор игры.
 * @apiSuccess {String}   set.gameName      Имя игры.
 * @apiSuccess {Integer}  set.teamId        Идентификатор команды.
 * @apiSuccess {String}   set.teamName      Имя команды.
 * @apiSuccess {Object[]} set.lineUp        Список основы на сет (Array of Objects).
 * @apiSuccess {Integer}  set.lineUp.id     Идентификатор игрока.
 * @apiSuccess {String}   set.lineUp.name   Имя игрока.
 * @apiSuccess {Integer}  set.lineUp.num    Номер игрока.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"id":1,"setNum":2,"startRotation":5,"startServe":false,"isEnd":false,"gameId":1,"gameName":"qwe","teamId":1,"teamName":"Барсы","lineUp":[{"id":1,"name":"Вася","num":1},{"id":2,"name":"Петя","num":2},{"id":3,"name":"Коля","num":3}]}
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/set/:id', set.getSetById); //выборка сета по Id

var stat = require('./api_v1/stat');
/**
 * @api {get} /api/v1/stat Получение статистики по сету
 * @apiVersion 1.0.0
 * @apiName GetStat
 * @apiGroup Stat
 *
 * @apiDescription Выдает статистику действий игроков по сету
 *
 * @apiParam {Integer} set     Идентификатор сета
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/stat?set=1
 *
 * @apiSuccess {Object[]} stat            Список статистики по дейсвтиям игроков в сете (Array of Objects).
 * @apiSuccess {Integer}  stat.id         Идентификатор объекта зарегистрированного действия.
 * @apiSuccess {Integer}  stat.playerId   Идентификатор игрока.
 * @apiSuccess {String}   stat.name       Имя игрока.
 * @apiSuccess {Integer}  stat.num        Нимер игрока.
 * @apiSuccess {Integer}  stat.action     Идентификатор дейсвтия игрока.
 * @apiSuccess {Integer}  stat.scoreWe    Очки наши после действия.
 * @apiSuccess {Integer}  stat.scoreThey  Очки противника после действия.
 * @apiSuccess {Integer}  stat.rotation   Расстановка после действия.
 * @apiSuccess {Boolean}  stat.serve      Подача после действия (0-Мы, 1-Противник).
 * @apiSuccess {Boolean}  stat.inRally    Признак того, что розыгрыш не окончен.
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 * @apiError (Error 400) BadRequest Не указан параметр set запроса или параметр не числовой.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{"id":1,"playerId":1,"name":"Вася","num":1,"action":11,"scoreWe":0,"scoreThey":1,"rotation":1,"serve":true,"inRally":false},{"id":2,"playerId":1,"name":"Вася","num":1,"action":12,"scoreWe":1,"scoreThey":1,"rotation":2,"serve":true,"inRally":false}]
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.get('/api/v1/stat', stat.getStat); //выборка статистики по сету (параметр в запросе)

var sync = require('./api_v1/sync');
/**
 * @api {post} /api/v1/syncbyteam Передача всех данных в рамках команды для записи в БД на сервере
 * @apiVersion 1.0.0
 * @apiName SyncDBByTeam
 * @apiGroup Synchronization
 *
 * @apiDescription принимает на вход json объект со всеми данными по команде и записывает его в БД
 *
 * @apiParam {Integer}  teamId                       Идентификатор команды.
 * @apiParam {String}   teamName                     Имя команды.
 * @apiParam {Object[]} teamPlayers                  Игроки команды (Array of Objects).
 * @apiParam {Integer}  teamPlayers.id               Идентификатор игрока.
 * @apiParam {Integer}  teamPlayers.num              Номер игрока.
 * @apiParam {String}   teamPlayers.name             Имя игрока.
 * @apiParam {Object[]} teamGames                    Игры команды (Array of Objects).
 * @apiParam {Integer}  teamGames.id                 Идентификатор игры.
 * @apiParam {String}   teamGames.name               Имя игры.
 * @apiParam {Integer}  teamGames.setWe              Количество выигранных сетов нами.
 * @apiParam {Integer}  teamGames.setThey            Количество выигранных сетов противником.
 * @apiParam {Boolean}  teamGames.isEnd              Признак окончания игры.
 * @apiParam {Object[]} teamSets                     Список всех сетов игр (Array of Objects).
 * @apiParam {Integer}  teamSets.id                  Идентификатор сета.
 * @apiParam {String}   teamSets.setNum              Номер сета.
 * @apiParam {Integer}  teamSets.startRotation       Начальная расстановка в сете.
 * @apiParam {Boolean}  teamSets.startServe          Начальная подача в сете (0-Мы, 1-Противник).
 * @apiParam {Boolean}  teamSets.isEnd               Признак окончания сета.
 * @apiParam {Object[]} teamLineUp                   Список основы и запаса по сетам (Array of Objects).
 * @apiParam {Integer}  teamLineUp.id                Идентификатор игрока.
 * @apiParam {Integer}  teamLineUp.set               Идентификатор сета.
 * @apiParam {Boolean}  teamLineUp.isMain            Признак основы или запаса.
 * @apiParam {Object[]} teamStat                     Список статистики по дейсвтиям игроков (Array of Objects).
 * @apiParam {Integer}  teamStat.id                  Идентификатор объекта зарегистрированного действия.
 * @apiParam {Integer}  teamStat.player              Идентификатор игрока.
 * @apiParam {Integer}  teamStat.action              Идентификатор дейсвтия игрока.
 * @apiParam {Integer}  teamStat.scoreWe             Очки наши после действия.
 * @apiParam {Integer}  teamStat.scoreThey           Очки противника после действия.
 * @apiParam {Integer}  teamStat.rotation            Расстановка после действия.
 * @apiParam {Boolean}  teamStat.serve               Подача после действия (0-Мы, 1-Противник).
 * @apiParam {Boolean}  teamStat.inRally             Признак того, что розыгрыш не окончен.
 *
 * @apiExample Example usage:
 * http://localhost:3000/api/v1/syncbyteam
 * {
 * "teamId":1,
 * "teamName": "Россия",
 * "teamPlayers":[
 *  {"id": 1, "team": 1, "num": 1, "name": "qwe"},
 *  {"id": 2, "team": 1, "num": 2, "name": "asd"}
 * ],
 * "teamGames":[
  * {"id": 1, "team": 1, "name": "Сербия", "setWe": 1, "setThey": 1, "isEnd": false},
  * {"id": 2, "team": 1, "name": "Пербия", "setWe": 1, "setThey": 1, "isEnd": false}
 * ],
 * "teamSets":[
  * {"id": 1, "game": 1, "setNum": 1, "startRotation": 1, "startServe": true, "isEnd": false}
 * ],
 * "teamLineUp":[
  * {"player": 1, "set": 1, "isMain": true},
  * {"player": 2, "set": 1, "isMain": true}
 * ],
 * "teamStat":[
  * {"id": 1, "set": 1, "player": 1, "action": 12, "scoreWe": 0, "scoreThey": 1, "rotation": 2, "serve": false, "inRally": false},
  * {"id": 2, "set": 1, "player": 1, "action": 15, "scoreWe": 1, "scoreThey": 1, "rotation": 3, "serve": true, "inRally": false}
 * ]
 * }
 *
 * @apiError (Error 503) ServiceUnavailable Нет подключения к базе данных или ошибка в запросе к БД.
 * @apiError (Error 400) BadRequest Не указан требуемый параметр запроса или параметр не того типа двнных.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 503 Service Unavailable
 *     {"error": "Текст ошибки"}
 */
app.post('/api/v1/syncbyteam', sync.syncDBByTeam); //Синхронизайия данных по команде (на вход летят JSON данные полные по команде)

var server = app.listen((process.env.PORT || 3000), function () { //стартуем сервак

  var host = server.address().address;
  var port = server.address().port;

  logger.info('Example app listening at http://%s:%s', host, port);

})
