var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Board = (function () {
    function Board(map) {
        this.map = map;
        this.robots = [];
        this.lasers = [];
        this.flags = [];
        if (Board.Instance != null) {
            throw new Error("Board singleton already exists!");
        }
        Board.Instance = this;
        this.loadBoard();
    }
    Board.prototype.loadBoard = function () {
        for (var _i = 0, _a = this.map.objects['Object Layer']; _i < _a.length; _i++) {
            var object = _a[_i];
            var x = Phaser.Math.snapToFloor(object.x, this.map.tileWidth) / this.map.tileWidth;
            var y = Phaser.Math.snapToFloor(object.y, this.map.tileHeight) / this.map.tileHeight;
            var position = new BoardPosition(x, y);
            if (object.type == "Laser") {
                var newLaser = new Laser(position, Direction.fromDegrees(object.rotation), object.properties.Count);
                this.lasers.push(newLaser);
            }
            else if (object.type == "Flag") {
                var newFlag = new Flag(position, object.order);
                this.flags.push(newFlag);
                if (newFlag.order > Flag.highestOrder) {
                    Flag.highestOrder = newFlag.order;
                }
            }
        }
    };
    Board.prototype.onPlayerJoined = function (playerID) {
        var newRobot = new Robot(playerID.id, new BoardPosition(this.robots.length, 0), Direction.S, 3); // TODO: can't start all robots at the same place
        this.robots.push(newRobot);
    };
    Board.prototype.clearRobots = function () {
        this.robots = [];
    };
    Board.prototype.runTurnAsync = function (turnsData) {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < Board.PHASE_COUNT)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.runRobotMovementAsync(turnsData, i)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.executeBoardElementsAsync(i)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.fireLasersAsync()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.touchFlagsAsync()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.runRobotMovementAsync = function (turnsData, phaseNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var movements, _i, movements_1, movement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        movements = turnsData.filter(function (x) { return !x.robot.isDead(); })
                            .map(function (x) { return ({ robot: x.robot, programCard: x.programCards[phaseNumber] }); })
                            .sort(function (a, b) { return b.programCard.priority - a.programCard.priority; });
                        _i = 0, movements_1 = movements;
                        _a.label = 1;
                    case 1:
                        if (!(_i < movements_1.length)) return [3 /*break*/, 4];
                        movement = movements_1[_i];
                        return [4 /*yield*/, this.runRobotProgram(movement.robot, movement.programCard)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.moveRobot = function (robot, distance, direction) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        distance = Math.round(distance); // just in case
                        if (distance < 0)
                            direction = direction.opposite();
                        _a.label = 1;
                    case 1:
                        if (!(distance !== 0)) return [3 /*break*/, 6];
                        distance -= Math.sign(distance);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.moveRobotOneTile(robot, direction)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.getTile = function (position) {
        if (position && this.isPositionOnBoard(position)) {
            return new BoardTile(this.map, position);
        }
        return null;
    };
    Board.prototype.isPositionOnBoard = function (position) {
        return position.x < this.map.width &&
            position.x >= 0 &&
            position.y < this.map.height &&
            position.y >= 0;
    };
    Board.prototype.canMoveRobot = function (robot, direction) {
        if (this.hasObstacleInDirection(robot.position, direction)) {
            return false;
        }
        var newPosition = robot.position.getAdjacentPosition(direction);
        var tile = this.getTile(newPosition);
        if (!tile || tile.isPitTile()) {
            return true;
        }
        var pushedRobot = this.robots.filter(function (x) { return x.position.equals(newPosition); })[0];
        return !pushedRobot || this.canMoveRobot(pushedRobot, direction);
    };
    Board.prototype.moveRobotOneTile = function (robot, direction) {
        return __awaiter(this, void 0, void 0, function () {
            var newPosition, tile, pushedRobot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.canMoveRobot(robot, direction)) {
                            return [2 /*return*/];
                        }
                        newPosition = robot.position.getAdjacentPosition(direction);
                        tile = this.getTile(newPosition);
                        if (!tile || tile.isPitTile()) {
                            robot.removeFromBoard();
                            return [2 /*return*/];
                        }
                        pushedRobot = this.robots.filter(function (x) { return x.position.equals(newPosition); })[0];
                        if (!pushedRobot) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all([this.moveRobotOneTile(pushedRobot, direction), robot.moveAsync(newPosition)])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, robot.moveAsync(newPosition)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.hasObstacleInDirection = function (tilePosition, direction) {
        var position = new BoardPosition(tilePosition);
        var thisTile = this.getTile(position);
        var nextTile = this.getTile(position.getAdjacentPosition(direction));
        if (thisTile && thisTile.hasObstacleInDirection(direction)) {
            return true;
        }
        else if (nextTile && nextTile.hasObstacleInDirection(direction.opposite())) {
            return true;
        }
        return false;
    };
    Board.prototype.runRobotProgram = function (robot, programAction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isPositionOnBoard(robot.position)) {
                            return [2 /*return*/];
                        }
                        _a = programAction.type;
                        switch (_a) {
                            case ProgramCardType.ROTATE: return [3 /*break*/, 1];
                            case ProgramCardType.MOVE: return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, robot.rotateAsync(programAction.distance)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.moveRobot(robot, programAction.distance, robot.orientation)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.executeBoardElementsAsync = function (phase) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runConveyorBeltsAsync()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.runPushersAsync(phase)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.runGearsAsync()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.runConveyorBeltsAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, robot, moveDirection, newTile, rotation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('Running Conveyor Belts...');
                        _i = 0, _a = this.robots;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        robot = _a[_i];
                        if (!!this.isConveyorStationaryBot(robot)) return [3 /*break*/, 3];
                        moveDirection = this.getTile(robot.position).conveyorBeltMovementDirection();
                        console.log("Moving robot in (" + robot.position.x + ", " + robot.position.y + ") - Direction: " + moveDirection);
                        newTile = this.getTile(robot.position.getAdjacentPosition(moveDirection));
                        this.moveRobotAlongConveyorAsync(robot, moveDirection);
                        if (!newTile) return [3 /*break*/, 3];
                        rotation = newTile.conveyorBeltRotationFromDirection(moveDirection.opposite());
                        console.log("Rotation: " + rotation);
                        return [4 /*yield*/, robot.rotateAsync(rotation)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.moveRobotAlongConveyorAsync = function (robot, direction) {
        return __awaiter(this, void 0, void 0, function () {
            var newPosition, tile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newPosition = robot.position.getAdjacentPosition(direction);
                        return [4 /*yield*/, robot.moveAsync(newPosition)];
                    case 1:
                        _a.sent();
                        tile = this.getTile(newPosition);
                        if (!tile || tile.isPitTile()) {
                            robot.removeFromBoard();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.isConveyorStationaryBot = function (robot) {
        var tile = this.getTile(robot.position);
        var direction = tile.conveyorBeltMovementDirection();
        if (!direction) {
            return true;
        }
        var nextTile = this.getTile(robot.position.getAdjacentPosition(direction));
        if (!tile.isConveyorBelt()) {
            return true;
        }
        else if (nextTile && nextTile.isConveyorMerge()) {
            var otherTile = nextTile.getOtherConveyorEntrance(tile);
            var otherRobot = this.robotInPosition(otherTile.position);
            if (otherRobot) {
                return this.isConveyorStationaryBot(otherRobot);
            }
        }
        return false;
    };
    Board.prototype.robotInPosition = function (position) {
        for (var _i = 0, _a = this.robots; _i < _a.length; _i++) {
            var robot = _a[_i];
            if (robot.position.equals(position))
                return robot;
        }
        return null;
    };
    Board.prototype.runPushersAsync = function (phase) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, _i, _a, robot, tile;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        promises = [];
                        for (_i = 0, _a = this.robots; _i < _a.length; _i++) {
                            robot = _a[_i];
                            tile = this.map.getTile(robot.position.x, robot.position.y, "Wall Layer");
                            if (tile == null) {
                                continue;
                            }
                            if (tile.index == Tiles.Pusher135 && phase % 2 == 0) {
                                promises.push(this.moveRobotOneTile(robot, Direction.fromRadians(tile.rotation + PiOver2)));
                            }
                            else if (tile.index == Tiles.Pusher24 && phase % 2 == 1) {
                                promises.push(this.moveRobotOneTile(robot, Direction.fromRadians(tile.rotation + PiOver2)));
                            }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.runGearsAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, _i, _a, robot, tile;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        promises = [];
                        for (_i = 0, _a = this.robots; _i < _a.length; _i++) {
                            robot = _a[_i];
                            tile = this.map.getTile(robot.position.x, robot.position.y, "Floor Layer");
                            if (tile.index == Tiles.GearCCW) {
                                promises.push(robot.rotateAsync(-1));
                            }
                            else if (tile.index == Tiles.GearCW) {
                                promises.push(robot.rotateAsync(1));
                            }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.fireLasersAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, laser;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // TODO: figure out how long lasers take instead of using a constant delay. If using moving projectiles, they should complete
                        // when they hit the robot. If using instant-firing beams, they should complete when their animation finishes.
                        for (_i = 0, _a = this.lasers; _i < _a.length; _i++) {
                            laser = _a[_i];
                            laser.fire();
                        }
                        return [4 /*yield*/, delay(500)];
                    case 1:
                        _b.sent(); // give the players 500 ms to watch the lasers fire.
                        return [2 /*return*/];
                }
            });
        });
    };
    Board.prototype.touchFlagsAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, flag, _b, _c, robot;
            return __generator(this, function (_d) {
                for (_i = 0, _a = this.flags; _i < _a.length; _i++) {
                    flag = _a[_i];
                    for (_b = 0, _c = this.robots; _b < _c.length; _b++) {
                        robot = _c[_b];
                        if (robot.position.equals(flag.position))
                            flag.touchedBy(robot);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    return Board;
}());
Board.PHASE_COUNT = 5;
var PiOver2 = Math.PI / 2;
var Point = Phaser.Point;
Math.sign = function (x) {
    return x == 0 ? 0 : x < 0 ? -1 : 1;
};
/** Promise version of setTimeout. Waits the specified number of milliseconds. Compatible with async/await. */
function delay(milliseconds) {
    return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
}
/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>
/// <reference path="utility.ts"/>
var phaserGame, map, wallLayer, board, laserProjectile;
var GameState;
(function (GameState) {
    GameState[GameState["Initializing"] = 0] = "Initializing";
    GameState[GameState["WaitingForPlayerInput"] = 1] = "WaitingForPlayerInput";
    GameState[GameState["PlayingActions"] = 2] = "PlayingActions";
})(GameState || (GameState = {}));
var Main = (function () {
    function Main() {
        this.gameState = GameState.Initializing;
        this.selectedCards = [];
        this.playerSubmittedCards = {};
    }
    Main.prototype.preload = function () {
        phaserGame.load.baseURL = '/';
        //phaserGame.load.crossOrigin = 'anonymous';
        phaserGame.load.image('laser-emitter', 'images/Laser%20Small.png');
        phaserGame.load.image('laser-beam', 'images/Laser%20Segment.png');
        phaserGame.load.image('tileset', 'images/Spritesheet%20Small.png');
        phaserGame.load.image('player-card', 'images/player-card.png');
        phaserGame.load.image('laser-projectile', 'images/laser-projectile.png');
        phaserGame.load.spritesheet('robots', 'images/robots.png', 75, 75);
        phaserGame.load.tilemap('tilemap', 'maps/Cross.json', null, Phaser.Tilemap.TILED_JSON);
    };
    Main.prototype.create = function () {
        map = phaserGame.add.tilemap('tilemap');
        map.addTilesetImage('RoboRallyOriginal', 'tileset');
        map.createLayer('Floor Layer').resizeWorld();
        wallLayer = map.createLayer('Wall Layer');
        laserProjectile = phaserGame.add.weapon(-1, 'laser-projectile');
        laserProjectile.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        laserProjectile.bulletSpeed = 400;
        laserProjectile.bulletAngleOffset = 90;
        laserProjectile.fireRate = 0;
        board = new Board(map);
        initRoboRally();
    };
    Main.prototype.update = function () {
    };
    Main.prototype.render = function () {
        if (board) {
            for (var _i = 0, _a = board.lasers; _i < _a.length; _i++) {
                var laser = _a[_i];
                laser.render();
            }
        }
    };
    Main.prototype.waitForPlayers = function () {
        var _this = this;
        this.showWaitingPlayers(clientGame);
        if (clientGame.isHost()) {
            socket.on('joined', function (clientId) {
                clientGame.addPlayer(clientId);
                if (clientGame.isHost()) {
                    socket.emit('broadcastPlayers', clientGame.getPlayers());
                }
                _this.showWaitingPlayers(clientGame);
            });
        }
        else {
            this.waitForCards();
            socket.on('broadcastPlayers', function (players) {
                clientGame.setPlayers(players);
                _this.showWaitingPlayers(clientGame);
            });
        }
    };
    Main.prototype.showWaitingPlayers = function (clientGame) {
        $('.playersList').empty();
        clientGame.getPlayers().forEach(function (player) {
            var playerItem = $('<li class="playerItem">' + player.friendlyName + '</li>');
            playerItem.data('player', player);
            $('.playersList').append(playerItem);
        });
    };
    Main.prototype.startGame = function () {
        $('.startGame').addClass("hidden");
        $('.quitGame').removeClass("hidden");
        socket.off('joined');
        socket.off('broadcastPlayers');
        this.startNewTurn();
    };
    Main.prototype.startNewTurn = function () {
        this.gameState = GameState.WaitingForPlayerInput;
        var players = clientGame.getPlayers();
        var handSizes = players.map(function () { return 9; });
        var hands = this.dealCards(handSizes);
        var handData = {};
        for (var i = 0; i < players.length; i++) {
            handData[players[i].id] = hands[i];
        }
        socket.emit('dealtCards', handData);
        this.showCards(hands[0]);
        this.waitForAllSubmissions();
    };
    Main.prototype.quitGame = function () {
        window.location.href = "/";
    };
    Main.prototype.waitForCards = function () {
        var _this = this;
        socket.on('dealtCards', function (handData) {
            socket.off('dealtCards');
            var cardData = handData[clientGame.clientId.id];
            _this.cards = cardData.map(function (c) { return new ProgramCard(c.type, c.distance, c.priority); });
            _this.showCards(_this.cards);
            _this.waitForAllSubmissions();
        });
    };
    Main.prototype.waitForAllSubmissions = function () {
        var _this = this;
        socket.on('submitTurn', function (submittedTurn) {
            _this.playerSubmittedCards[submittedTurn.playerId] = submittedTurn.cards.map(function (c) { return new ProgramCard(c.type, c.distance, c.priority); });
            $('.playersList .playerItem').filter(function () { return $(this).data('player').id == submittedTurn.playerId; }).addClass('submitted');
            if (_this.allPlayersSubmitted)
                _this.runNextTurnAsync();
        });
    };
    Main.prototype.showCards = function (cards) {
        $('.statusText').html('Choose Your Cards');
        $('.cardContainer').empty();
        cards.forEach(function (card) {
            var cardChoice = $("<li class=\"cardChoice\" title=\"" + card.toString() + "\">" + card.toHtml() + "<span class=\"phaseOrder\"></span></li>");
            cardChoice.data('card', card);
            $('.cardContainer').append(cardChoice);
        });
        $('.cardContainer').append("<a href=# class=\"collapse\" onclick=\"$('.cardContainer').toggleClass('collapsed')\"></a>");
    };
    Main.prototype.dealCards = function (handSizes) {
        // return all cards to the deck (by simply recreating the deck in its initial state)
        this.globalCardDeck = CardDeck.newProgramDeck();
        return this.globalCardDeck.deal(handSizes);
    };
    Main.prototype.chooseCard = function (element) {
        var _this = this;
        var card = $(element).data('card');
        if ($(element).hasClass('selected')) {
            this.selectedCards.splice(this.selectedCards.indexOf(card), 1);
            $(element).removeClass('selected');
            $(element).find('.phaseOrder').text('');
            $('.submitCards').addClass('hidden');
        }
        else {
            if (this.selectedCards.length < 5) {
                this.selectedCards.push(card);
                $(element).addClass('selected');
                $(element).find('.phaseOrder').text(this.selectedCards.length);
                if (this.selectedCards.length == 5) {
                    $('.submitCards').removeClass('hidden');
                }
                else {
                    $('.submitCards').addClass('hidden');
                }
            }
        }
        // update phase order
        $('.cardContainer .cardChoice').each(function (i, el) {
            var index = _this.selectedCards.indexOf($(el).data('card'));
            return $(el).find('.phaseOrder').text(index < 0 ? '' : index + 1);
        });
    };
    Main.prototype.submitSelectedCards = function () {
        if (this.selectedCards.length != 5) {
            alert("You must choose 5 cards to submit. You've only chosen " + this.selectedCards.length + ".");
            return;
        }
        this.playerSubmittedCards[clientGame.clientId.id] = this.selectedCards;
        $('.playersList .playerItem').filter(function () { return $(this).data('player').id == clientGame.clientId.id; }).addClass('submitted');
        socket.emit('submitTurn', {
            playerId: clientGame.clientId.id,
            cards: this.selectedCards
        });
        this.selectedCards = [];
        if (this.allPlayersSubmitted())
            this.runNextTurnAsync();
    };
    Main.prototype.allPlayersSubmitted = function () {
        return Object.keys(this.playerSubmittedCards).length == clientGame.getPlayers().length;
    };
    Main.prototype.runNextTurnAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var turns, _loop_1, this_1, robot, clientId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.gameState = GameState.PlayingActions;
                        turns = [];
                        _loop_1 = function (clientId) {
                            robot = Board.Instance.robots.filter(function (r) { return r.playerID == clientId; })[0];
                            turns.push(new RobotTurn(robot, this_1.playerSubmittedCards[clientId]));
                        };
                        this_1 = this;
                        for (clientId in this.playerSubmittedCards) {
                            _loop_1(clientId);
                        }
                        this.startNewTurn();
                        return [4 /*yield*/, Board.Instance.runTurnAsync(turns)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Main;
}());
var main;
function startGame() {
    main = new Main();
    phaserGame = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: function () { return main.preload(); }, create: function () { return main.create(); }, update: function () { return main.update(); }, render: main.render });
    ;
}
function initRoboRally() {
    var gameId = location.pathname.match(/^\/g\/(\w+)/)[1];
    clientGame = new ClientGame(gameId);
    socket = io();
    $('.code').text(gameId);
    $('.gameInfo').show();
    new QRCode($(".qrcode")[0], { text: "https://robo-rally.glitch.me/g/" + gameId, width: 66, height: 66 });
    if (!clientGame.isHost()) {
        clientGame.loadOrJoin();
    }
    if (clientGame.isHost()) {
        $('.startGame').removeClass('hidden').click(function () { return main.startGame(); });
        clientGame.addPlayer(clientGame.clientId);
    }
    main.waitForPlayers();
    $('.startGame').click(function () { return main.startGame(); });
    $('.quitGame').click(function () { return main.quitGame(); });
    $('.cardContainer').on('click', '.cardChoice', function () { main.chooseCard(this); });
    $('.submitCards').click(function () { return main.submitSelectedCards(); });
}
/// <reference path="main.ts"/>
var BoardPosition = (function (_super) {
    __extends(BoardPosition, _super);
    function BoardPosition(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var _this = this;
        if (typeof x === "number")
            _this = _super.call(this, x, y) || this;
        else
            _this = _super.call(this, x.x, x.y) || this;
        return _this;
    }
    BoardPosition.prototype.getAdjacentPosition = function (direction) {
        switch (direction) {
            case Direction.N:
                return new BoardPosition(this.x, this.y - 1);
            case Direction.E:
                return new BoardPosition(this.x + 1, this.y);
            case Direction.S:
                return new BoardPosition(this.x, this.y + 1);
            case Direction.W:
                return new BoardPosition(this.x - 1, this.y);
        }
    };
    /** Returns the center of the tile in pixel coordinates. */
    BoardPosition.prototype.toCenterPixelPosition = function () {
        return BoardPosition.toCenterPixelPosition(this);
    };
    BoardPosition.toCenterPixelPosition = function (p, y) {
        var x;
        if (p instanceof Point) {
            x = p.x;
            y = p.y;
        }
        else
            x = p;
        var tile = map.getTile(x, y);
        return new Point(tile.centerX + tile.worldX, tile.centerY + tile.worldY);
    };
    /** Returns the top left of the tile in pixel coordinates. */
    BoardPosition.prototype.toPixelPosition = function () {
        return BoardPosition.toPixelPosition(this);
    };
    BoardPosition.toPixelPosition = function (p, y) {
        var x;
        if (p instanceof Point) {
            x = p.x;
            y = p.y;
        }
        else
            x = p;
        var tile = map.getTile(x, y);
        return new Point(tile.worldX, tile.worldY);
    };
    BoardPosition.prototype.clone = function () {
        return new BoardPosition(this.x, this.y);
    };
    return BoardPosition;
}(Point));
var BoardTile = (function () {
    function BoardTile(map, position) {
        this.map = map;
        this.position = new BoardPosition(position.x, position.y);
    }
    BoardTile.prototype.getPhaserTile = function (layerName) {
        return this.map.getTile(this.position.x, this.position.y, layerName);
    };
    BoardTile.prototype.isPitTile = function () {
        var tile = this.getPhaserTile("Floor Layer");
        switch (tile.index) {
            case Tiles.PitFourSides:
            case Tiles.PitThreeSides:
            case Tiles.PitLShaped:
            case Tiles.PitFourCorners:
                return true;
            default:
                return false;
        }
    };
    BoardTile.prototype.isConveyorBelt = function () {
        var tile = this.getPhaserTile("Floor Layer");
        if (tile.index <= 7) {
            return true;
        }
        return false;
    };
    BoardTile.prototype.isFastConveyorBelt = function () {
        var tile = this.getPhaserTile("Floor Layer");
        if (tile.index >= 4 && tile.index <= 7) {
            return true;
        }
        return false;
    };
    BoardTile.prototype.isConveyorMerge = function () {
        var tile = this.getPhaserTile("Floor Layer");
        switch (tile.index) {
            case Tiles.ConveyorSideMerge:
            case Tiles.ConveyorFrontMerge:
            case Tiles.FastConveyorSideMerge:
            case Tiles.FastConveyorFrontMerge:
                return true;
            default:
                return false;
        }
    };
    BoardTile.prototype.getOtherConveyorEntrance = function (tile) {
        for (var _i = 0, _a = this.getConveyorEntrances(); _i < _a.length; _i++) {
            var position = _a[_i];
            if (tile.position.x != position.x || tile.position.y != position.y) {
                return new BoardTile(this.map, position);
            }
        }
    };
    BoardTile.prototype.getConveyorEntrances = function () {
        var entrances;
        var tile = this.getPhaserTile("Floor Layer");
        switch (tile.index) {
            case Tiles.Conveyor:
            case Tiles.ConveyorTurn:
            case Tiles.FastConveyor:
            case Tiles.FastConveyorTurn:
                return [
                    this.position.getAdjacentPosition(Direction.W.rotate(tile.rotation))
                ];
            case Tiles.ConveyorSideMerge:
            case Tiles.FastConveyorSideMerge:
                return [
                    this.position.getAdjacentPosition(Direction.W.rotate(tile.rotation)),
                    this.position.getAdjacentPosition(Direction.S.rotate(tile.rotation))
                ];
            case Tiles.ConveyorFrontMerge:
            case Tiles.FastConveyorFrontMerge:
                return [
                    this.position.getAdjacentPosition(Direction.N.rotate(tile.rotation)),
                    this.position.getAdjacentPosition(Direction.S.rotate(tile.rotation))
                ];
        }
    };
    BoardTile.prototype.hasObstacleInDirection = function (direction) {
        direction = Direction.from(direction);
        var tile = this.getPhaserTile("Wall Layer");
        if (tile == null) {
            return false;
        }
        if (tile.index == Tiles.WallCorner
            && (Direction.fromRadians(tile.rotation) == direction || Direction.fromRadians(tile.rotation - PiOver2) == direction)) {
            return true;
        }
        else if (tile.index == Tiles.Wall
            && Direction.fromRadians(tile.rotation) == direction) {
            return true;
        }
        else if ((tile.index == Tiles.Pusher135 || tile.index == Tiles.Pusher135)
            && Direction.fromRadians(tile.rotation - PiOver2) == direction) {
            return true;
        }
        return false;
    };
    BoardTile.prototype.conveyorBeltRotationFromDirection = function (direction) {
        if (this.isConveyorBelt()) {
            var phaserTile = this.getPhaserTile("Floor Layer");
            var factor = 1;
            if (phaserTile.flipped) {
                direction = direction.opposite();
                factor = -1;
            }
            if (phaserTile.index == Tiles.ConveyorTurn || phaserTile.index == Tiles.FastConveyorTurn) {
                // rotates left from West
                if (Direction.W.rotate(phaserTile.rotation) == direction) {
                    return -1 * factor;
                }
            }
            else if (phaserTile.index == Tiles.ConveyorSideMerge || phaserTile.index == Tiles.FastConveyorSideMerge) {
                // rotates right from South
                if (Direction.S.rotate(phaserTile.rotation) == direction) {
                    return 1 * factor;
                }
            }
            else if (phaserTile.index == Tiles.ConveyorFrontMerge || phaserTile.index == Tiles.FastConveyorFrontMerge) {
                // rotates left from North
                if (Direction.N.rotate(phaserTile.rotation) == direction) {
                    return -1 * factor;
                }
                // rotates right from South
                if (Direction.S.rotate(phaserTile.rotation) == direction) {
                    return 1 * factor;
                }
            }
        }
        return 0;
    };
    BoardTile.prototype.conveyorBeltMovementDirection = function () {
        if (this.isConveyorBelt()) {
            var phaserTile = this.getPhaserTile("Floor Layer");
            switch (phaserTile.index) {
                case Tiles.Conveyor:
                case Tiles.ConveyorSideMerge:
                case Tiles.ConveyorFrontMerge:
                case Tiles.FastConveyor:
                case Tiles.FastConveyorSideMerge:
                case Tiles.FastConveyorFrontMerge:
                    return Direction.E.rotate(phaserTile.rotation);
                case Tiles.ConveyorTurn:
                case Tiles.FastConveyorTurn:
                    return Direction.N.rotate(phaserTile.rotation);
            }
        }
    };
    return BoardTile;
}());
var Tiles;
(function (Tiles) {
    Tiles[Tiles["None"] = 0] = "None";
    Tiles[Tiles["Conveyor"] = 1] = "Conveyor";
    Tiles[Tiles["ConveyorTurn"] = 2] = "ConveyorTurn";
    Tiles[Tiles["ConveyorSideMerge"] = 3] = "ConveyorSideMerge";
    Tiles[Tiles["ConveyorFrontMerge"] = 4] = "ConveyorFrontMerge";
    Tiles[Tiles["FastConveyor"] = 5] = "FastConveyor";
    Tiles[Tiles["FastConveyorTurn"] = 6] = "FastConveyorTurn";
    Tiles[Tiles["FastConveyorSideMerge"] = 7] = "FastConveyorSideMerge";
    Tiles[Tiles["FastConveyorFrontMerge"] = 8] = "FastConveyorFrontMerge";
    Tiles[Tiles["Floor"] = 9] = "Floor";
    Tiles[Tiles["Option"] = 10] = "Option";
    Tiles[Tiles["Repair"] = 11] = "Repair";
    Tiles[Tiles["Unused"] = 12] = "Unused";
    Tiles[Tiles["WallCorner"] = 13] = "WallCorner";
    Tiles[Tiles["Wall"] = 14] = "Wall";
    Tiles[Tiles["PitFourSides"] = 15] = "PitFourSides";
    Tiles[Tiles["PitThreeSides"] = 16] = "PitThreeSides";
    Tiles[Tiles["Pusher135"] = 17] = "Pusher135";
    Tiles[Tiles["Pusher24"] = 18] = "Pusher24";
    Tiles[Tiles["PitLShaped"] = 19] = "PitLShaped";
    Tiles[Tiles["PitFourCorners"] = 20] = "PitFourCorners";
    Tiles[Tiles["GearCCW"] = 21] = "GearCCW";
    Tiles[Tiles["GearCW"] = 22] = "GearCW";
})(Tiles || (Tiles = {}));
var CardDeck = (function () {
    function CardDeck(cards) {
        this.cards = cards;
    }
    CardDeck.newProgramDeck = function () {
        var cards = [];
        var priority = 10;
        for (var i = 0; i < 6; i++) {
            cards.push(new ProgramCard(ProgramCardType.ROTATE, 2, priority));
            priority += 10;
        }
        for (var i = 0; i < 36; i++) {
            var direction = i % 2 == 0 ? -1 : 1;
            cards.push(new ProgramCard(ProgramCardType.ROTATE, direction, priority));
            priority += 10;
        }
        for (var i = 0; i < 6; i++) {
            cards.push(new ProgramCard(ProgramCardType.MOVE, -1, priority));
            priority += 10;
        }
        for (var i = 0; i < 18; i++) {
            cards.push(new ProgramCard(ProgramCardType.MOVE, 1, priority));
            priority += 10;
        }
        for (var i = 0; i < 12; i++) {
            cards.push(new ProgramCard(ProgramCardType.MOVE, 2, priority));
            priority += 10;
        }
        for (var i = 0; i < 6; i++) {
            cards.push(new ProgramCard(ProgramCardType.MOVE, 3, priority));
            priority += 10;
        }
        return new CardDeck(cards);
    };
    CardDeck.newOptionDeck = function () {
        return new CardDeck(OptionCard.All);
    };
    Object.defineProperty(CardDeck.prototype, "count", {
        get: function () {
            return this.cards.length;
        },
        enumerable: true,
        configurable: true
    });
    CardDeck.prototype.deal = function (handSizes) {
        this.shuffle();
        var hands = [];
        var compare = (this.cards.length && this.cards[0].constructor.compare) || (function (a, b) { return 0; }); // sort hands if a compare function exists
        for (var _i = 0, handSizes_1 = handSizes; _i < handSizes_1.length; _i++) {
            var size = handSizes_1[_i];
            hands.push(this.cards.splice(0, size).sort(compare));
        }
        return hands;
    };
    /** Draws a single card from the deck. Returns undefined if no cards are left. */
    CardDeck.prototype.drawCard = function () {
        // Assume already shuffled?
        return this.cards.shift();
    };
    // From https://basarat.gitbooks.io/algorithms/content/docs/shuffling.html
    CardDeck.prototype.shuffle = function () {
        for (var i = 0; i < this.cards.length; i++) {
            // choose a random not-yet-placed item to place there
            // must be an item AFTER the current item, because the stuff
            // before has all already been placed
            var randomChoiceIndex = this.getRandom(i, this.cards.length - 1);
            // place our random choice in the spot by swapping
            _a = [this.cards[randomChoiceIndex], this.cards[i]], this.cards[i] = _a[0], this.cards[randomChoiceIndex] = _a[1];
        }
        var _a;
    };
    CardDeck.prototype.getRandom = function (low, high) {
        return low + Math.floor(Math.random() * (high - low + 1));
    };
    return CardDeck;
}());
var PlayerID = (function () {
    function PlayerID(id, friendlyName) {
        this.id = id;
        this.friendlyName = friendlyName;
    }
    return PlayerID;
}());
var ClientGame = (function () {
    function ClientGame(gameId) {
        this.gameId = gameId;
        this.getOrCreateClientId();
        this.gameData = {
            gameId: gameId,
            hostId: null,
            playerIds: []
        };
    }
    ClientGame.prototype.setSelfAsHost = function () {
        this.gameData.hostId = this.clientId;
        this.saveGame();
    };
    ClientGame.prototype.isHost = function () {
        return this.gameData.hostId && this.gameData.hostId.id == this.clientId.id;
    };
    ClientGame.prototype.addPlayer = function (playerId) {
        if (!this.gameData.playerIds.some(function (x) { return x.id == playerId.id; })) {
            this.gameData.playerIds.push(playerId);
            this.saveGame();
            Board.Instance.onPlayerJoined(playerId);
        }
    };
    ClientGame.prototype.getPlayers = function () {
        return this.gameData.playerIds;
    };
    ClientGame.prototype.setPlayers = function (players) {
        this.gameData.playerIds = players;
        this.saveGame();
        Board.Instance.clearRobots();
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var playerId = players_1[_i];
            Board.Instance.onPlayerJoined(playerId);
        }
    };
    ClientGame.prototype.saveGame = function () {
        localStorage['Game_' + this.gameId] = JSON.stringify(this.gameData);
    };
    ClientGame.prototype.loadOrJoin = function () {
        if (!this.loadGame()) {
            this.joinGame();
        }
    };
    ClientGame.prototype.loadGame = function () {
        if (!localStorage['Game_' + this.gameId]) {
            return false;
        }
        this.gameData = JSON.parse(localStorage['Game_' + this.gameId]);
        socket.emit('join', { gameId: this.gameId, clientId: this.clientId });
        // TODO: load state
        // Host loads from local storage, everyone else gets the broadcast when they join
        if (this.isHost()) {
            for (var _i = 0, _a = this.gameData.playerIds; _i < _a.length; _i++) {
                var playerId = _a[_i];
                Board.Instance.onPlayerJoined(playerId);
            }
            socket.emit('broadcastPlayers', this.getPlayers());
        }
        return true;
    };
    ClientGame.prototype.joinGame = function () {
        socket.emit('join', { gameId: this.gameId, clientId: this.clientId });
    };
    ClientGame.prototype.getOrCreateClientId = function () {
        this.clientId = new PlayerID(null, null);
        if ('clientId' in localStorage) {
            this.clientId.id = localStorage['clientId'];
            this.clientId.friendlyName = localStorage['friendlyName'];
        }
        else {
            this.clientId.id = localStorage['clientId'] = Guid.newGuid();
            this.clientId.friendlyName = localStorage['friendlyName'] = generateName();
        }
    };
    return ClientGame;
}());
var ClientUI = (function () {
    function ClientUI() {
        this.state = ClientState.GAME_PENDING;
    }
    return ClientUI;
}());
var ClientState;
(function (ClientState) {
    ClientState[ClientState["GAME_PENDING"] = 0] = "GAME_PENDING";
    ClientState[ClientState["PROGRAMMING_REGISTERS"] = 1] = "PROGRAMMING_REGISTERS";
    ClientState[ClientState["EXECUTING_REGISTERS"] = 2] = "EXECUTING_REGISTERS";
    ClientState[ClientState["CLEAN_UP"] = 3] = "CLEAN_UP";
})(ClientState || (ClientState = {}));
/**
 * Represents the four board directions, North, East, South and West. This class is immutable. Equality comparisons work
 * as expected because the same objects are always returned for a given direction. (For example, Direction.E == Direction.W.opposite() will return true.)
 */
var Direction = (function () {
    function Direction(turns, name) {
        this.turns = turns;
        this.name = name;
    } // seeing "name" is handy in the chrome devtools
    Direction.fromTurns = function (turns) { return Direction.clamp(turns); };
    Direction.fromRadians = function (angleInRads) {
        return Direction.clamp(Math.round(angleInRads / PiOver2));
    };
    Direction.fromDegrees = function (angleInDeg) {
        return Direction.clamp(Math.round(angleInDeg / 90));
    };
    Direction.fromVector = function (v) {
        return Direction.fromRadians(Math.atan2(v.y, v.x) + PiOver2);
    };
    /** "Overloaded" conversion. Converts a number in radians or a Point to a Direction. For convenience, you can also pass in a Direction,
     *  which will be returned unchanged. */
    Direction.from = function (val) {
        return typeof val === 'number' ? Direction.fromRadians(val) : val instanceof Point ? Direction.fromVector(val) : val;
    };
    Direction.prototype.toDegrees = function () {
        return this.turns * 90;
    };
    Direction.prototype.toRadians = function () {
        return this.turns * PiOver2;
    };
    /** Returns a Phaser.Point for the unit vector for this direction. Positive x is east and positive y is south. */
    Direction.prototype.toVector = function () {
        var sign = this.turns % 3 == 0 ? -1 : 1;
        return new Point((this.turns & 1) * sign, +!(this.turns & 1) * sign);
    };
    Direction.prototype.opposite = function () {
        return this.addTurns(2);
    };
    Direction.prototype.addTurns = function (turnsCW) {
        return Direction.clamp(turnsCW + this.turns);
    };
    /**
     * Rotates a by a given angle, snapped to the nearest 90� turn. Use addTurns() instead if you want to rotate by quarter revolutions.
     * @param angle Angle in radians, unless useDegrees is set to true.
     * @param useDegrees
     */
    Direction.prototype.rotate = function (angle, useDegrees) {
        if (useDegrees === void 0) { useDegrees = false; }
        var deltaTurns = useDegrees ? angle / 90 : angle / PiOver2;
        return Direction.clamp(this.turns + deltaTurns);
    };
    Direction.clamp = function (direction) {
        var turns = direction instanceof Direction ? direction.turns : direction;
        if (turns < 0) {
            turns = (turns % 4) + 4;
        }
        return Direction.All[Math.floor(turns % 4)];
    };
    Direction.prototype.toString = function () {
        return this.name;
    };
    return Direction;
}());
Direction.N = new Direction(0, "North");
Direction.E = new Direction(1, "East");
Direction.S = new Direction(2, "South");
Direction.W = new Direction(3, "West");
Direction.All = [Direction.N, Direction.E, Direction.S, Direction.W];
var Flag = (function () {
    function Flag(position, order) {
        this.position = position;
        this.order = order;
    }
    Flag.prototype.touchedBy = function (robot) {
        if (this.order = robot.lastFlagOrder + 1) {
            robot.lastFlagOrder = this.order;
        }
        if (robot.lastFlagOrder >= Flag.highestOrder) {
        }
    };
    return Flag;
}());
Flag.highestOrder = 0;
/**
 * Describes the rules for setting up a game. Includes settings for the special rules some boards have.
 *
 *  Some special rules require support from the boards they use:
 *      -Capture the Flag requires the board to define a home zone for each team.
 *      -Frenetic Factory involves rotating sections of the board when a robot touches a flag. There's no GameSetting property for this. It's handled by the board.
 *
 *  The flag being moved by conveyor belts (as in Moving Targets) is considered a standard rule rather than a special rule. There are no maps where flags aren't moved
 *  despite being on conveyor belts.
 *
 *  If a map has no flags, players can only win by destroying all other teams.
 */
var GameSettings = (function () {
    function GameSettings(settings) {
        this.maxPlayers = 8;
        /** Currently only supports equal players per team. Teams of (maxPlayers / teamCount). For non-team games, set teamCount = maxPlayers. */
        this.teamCount = this.maxPlayers;
        /** If true, in team games, different robots from the team can touch each flag. Otherwise, a single robot must touch all the flags. */
        this.teamSharesFlags = false;
        this.startingOptionCards = 0;
        this.startingOptionCardChoices = 0;
        this.startingDamage = 0;
        this.robotLaserDamageMultiplier = 1;
        this.canPowerDown = true;
        this.wrenchesGiveOptionCard = false;
        /** Number of turns before a destroyed robot respawns. Used in Toggle Boggle. */
        this.respawnTime = 0;
        /** In CTF games, robot must capture the other team's flag and bring it back to their home board. */
        this.captureTheFlag = false;
        /** Whenever a robot touches a flag, its team gains control of that flag. First team to control all flags simultaneously wins. */
        this.controlAllFlags = false;
        /** In SuperBot games, one player is the SuperBot. The SuperBot fully heals each turn, does double laser damage, and is the only robot that can
          * touch flags. The player who kills the SuperBot becomes the new SuperBot. (See game rules for full details.) */
        this.superBot = false;
        /** In seconds, how long players have to program their robots. No time limit if < 0. */
        this.maxProgrammingTime = -1;
        /** In seconds, how long the last player has to submit their program after all other players have submitted theirs. No time limit if < 0. */
        this.lastPlayerProgrammingTime = 30;
        $.extend(this, settings);
    }
    return GameSettings;
}());
GameSettings.Default = new GameSettings();
GameSettings.OneOptionCard = new GameSettings({ startingOptionCards: 1 }); // Flag Fry, Madness Marathon
GameSettings.Tricksy = new GameSettings({ startingOptionCards: 1, startingOptionCardChoices: 3 });
GameSettings.DoubleDamage = new GameSettings({ robotLaserDamageMultiplier: 2 }); // Set to Kill
GameSettings.FactoryRejects = new GameSettings({ startingDamage: 2, canPowerDown: false });
GameSettings.OptionWorld = new GameSettings({ wrenchesGiveOptionCard: true });
GameSettings.BallLightning = new GameSettings({ maxProgrammingTime: 30 });
GameSettings.TightCollar = new GameSettings({ maxProgrammingTime: 60 });
GameSettings.SuperBot = new GameSettings({ superBot: true });
GameSettings.TandemCarnage = new GameSettings({ maxPlayers: 8, teamCount: 4, teamSharesFlags: true });
GameSettings.AllForOne = new GameSettings({ teamCount: 2 });
GameSettings.CaptureTheFlag = new GameSettings({ captureTheFlag: true, teamCount: 2 });
GameSettings.ToggleBoggle = new GameSettings({ controlAllFlags: true, teamCount: 2 });
GameSettings.WarZone = new GameSettings({ startingOptionCards: 1, teamCount: 2 });
var Guid = (function () {
    function Guid() {
    }
    Guid.newGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return Guid;
}());
var Laser = (function () {
    function Laser(position, facingDirection, damagePower) {
        this.position = position;
        this.damagePower = damagePower;
        this.sprites = [];
        this.beams = [];
        var pixelPos = position.toPixelPosition();
        var rot = facingDirection.toRadians() - PiOver2;
        this.direction = facingDirection.toVector();
        pixelPos.x += 10;
        pixelPos.y += map.tileHeight / 2;
        var center = position.toCenterPixelPosition();
        pixelPos.rotate(center.x, center.y, rot);
        var graphics = phaserGame.add.graphics(0, 0);
        graphics.lineStyle(2, 0x660000);
        var offsets = [-25, 0, 25];
        for (var i = 0; i < damagePower; i++) {
            var p = new Point(0, offsets[i]);
            p.rotate(0, 0, rot);
            p.add(pixelPos.x, pixelPos.y);
            var sprite = phaserGame.add.sprite(p.x, p.y, 'laser-emitter');
            sprite.anchor.set(0, 0.5);
            sprite.rotation = rot;
            this.sprites.push(sprite);
            var start = Point.multiply(this.direction, new Point(14, 14)).add(p.x, p.y);
            var length_1 = this.findBeamLength(position, this.direction);
            var end = new Point(length_1 * this.direction.x + start.x, length_1 * this.direction.y + start.y);
            this.beams.push(new Phaser.Line(start.x, start.y, end.x, end.y));
        }
    }
    Laser.prototype.findBeamLength = function (startTile, direction) {
        var current = startTile.clone();
        var exitDir = Direction.fromVector(direction);
        var enterDir = exitDir.opposite();
        var board = Board.Instance;
        var robots = board.robots;
        var length = -14; // Since beams travel in one direction, it's easier to use a scalar.
        while (board.isPositionOnBoard(current)) {
            length += map.tileWidth / 2;
            if (board.robotInPosition(current))
                break;
            length += map.tileWidth / 2 - 10;
            if (board.hasObstacleInDirection(current, exitDir))
                break;
            Point.add(current, direction, current);
            length += 10;
        }
        return length;
    };
    Laser.prototype.render = function () {
        for (var _i = 0, _a = this.beams; _i < _a.length; _i++) {
            var beam = _a[_i];
            phaserGame.debug.geom(beam, 'rgba(255,0,0,0.3)');
        }
    };
    Laser.prototype.fire = function () {
        var robots = Board.Instance.robots;
        var target = null;
        var dir = Direction.fromVector(this.direction);
        var current = this.position.clone();
        while (board.isPositionOnBoard(current)) {
            if (target = board.robotInPosition(current))
                break;
            else if (board.hasObstacleInDirection(current, dir))
                break;
            Point.add(current, this.direction, current);
        }
        if (target) {
            target.dealDamage(this.damagePower);
            var targetPos = target.sprite.position;
            for (var _i = 0, _a = this.beams; _i < _a.length; _i++) {
                var beam = _a[_i];
                laserProjectile.fire(beam.start, targetPos.x, targetPos.y);
            }
        }
    };
    return Laser;
}());
var words = ["Berry", "Blossom", "Bride", "Butterfly", "Candy", "Couple", "Cream", "Dear", "Dress", "Dumpling", "Flower", "Flute", "Girdle", "Glimmer", "Glisten", "Gloss", "Honey", "Incense", "Knit", "Lace", "Lark", "Lute", "Lyric", "Meadow", "Mellow", "Mother", "Music", "Nestle", "Nurture", "Pregnant", "Prim", "Queen", "Satin", "Sheen", "Show", "Silk", "Silky", "Sing", "Sister", "Skirt", "Skirt", "Smile", "Style", "Sugar", "Sweet", "Trim", "Tulip", "Tweet", "Velvet", "Wavy", "Wisp", "Wonder", "Dessert", "Fancy", "Lather", "Petal", "Droplet", "Pantomime", "Fragrance", "Glitter", "Sparkle", "Tragedy", "Cyclopean", "Trifle", "Luxury", "Euphoria", "Scintillate", "Sensual", "Malodorous", "Venerate", "Tress", "Ensorcel", "Fabulous", "Mirth", "Laconic", "Quiescent", "Reticent", "Saturnine", "Taciturn", "Fortuitous", "Tenebrous", "Morose", "Beloved", "Suitor", "Pungent", "Cherish", "Pristine", "Languish", "Adore", "Embrace", "Meander", "Bewilder", "Intricate", "Poem", "Poetry", "Poet", "Amethyst", "Aquamarine", "Azure", "Beige", "Sienna", "Umber", "Cardinal", "Carmine", "Cerulean", "Chartreuse", "Fuchsia", "Goldenrod", "Heliotrope", "Lavender", "Lilac", "Mauve", "Taupe", "Periwinkle", "Russet", "Saffron", "Vermilion", "Festival", "Animal", "Ape", "Autumn", "Beak", "Beast", "Bear", "Bee", "Beetle", "Berry", "Bird", "Blaze", "Blossom", "Boar", "Bog", "Buck", "Bush", "Butterfly", "Buzzard", "Canyon", "Cat", "Chill", "Chirp", "Clam", "Clearing", "Cobra", "Crab", "Creek", "Crow", "Dawn", "Deer", "Dirt", "Dusk", "Eagle", "Eel", "Fang", "Fin", "Fish", "Flower", "Fog", "Forest", "Frog", "Fruit", "Fungus", "Fur", "Gerbil", "Glen", "Gore", "Gorge", "Grape", "Grass", "Grove", "Grow", "Growl", "Growth", "Grub", "Hare", "Hawk", "Heather", "Hedge", "Hide", "Hill", "Hoary", "Hog", "Hoof", "Hop", "Horn", "Howl", "Ivy", "Jackal", "Jaw", "Jungle", "Kitten", "Lake", "Lark", "Larva", "Leaf", "Leopard", "Lizard", "Lobster", "Lush", "Maggot", "Mange", "Marsh", "Maw", "Meadow", "Mist", "Mite", "Mold", "Mole", "Monkey", "Moth", "Mud", "Mushroom", "Nature", "Nest", "Nettle", "Newt", "Nut", "Oak", "Owl", "Pack", "Panther", "Peach", "Plant", "Planter", "Rabbit", "Rain", "Ram", "Raptor", "Rat", "Raven", "Ripe", "River", "Rock", "Root", "Rose", "Sap", "Scorpion", "Sea", "Seal", "Season", "Seed", "Serpent", "Shark", "Shell", "Silt", "Skunk", "Sky", "Slither", "Slug", "Snake", "Soil", "Spider", "Spidery", "Spring", "Squid", "Stick", "Stone", "Storm", "Straw", "Summer", "Sun", "Swamp", "Tail", "Talon", "Tempest", "Thorn", "Thunder", "Tick", "Toad", "Tulip", "Tusk", "Tweet", "Twilight", "Vegetable", "Vegetation", "Viper", "Volcano", "Vulture", "Wasp", "Wave", "Weasel", "Weed", "Wheat", "Wing", "Winter", "Wood", "Worm", "Earth", "Bud", "Desert", "Field", "Glacier", "Mountain", "Prairie", "Tentacle", "Tundra", "Weevil", "Dune", "Pine", "Puppy", "Gnarled", "Stump", "Beard", "Water", "Wax", "Roar", "Ford", "Snarl", "Drink", "Flight", "Twig", "Tuft", "Fern", "Gully", "Lion", "Cactus", "Cloud", "Bean", "Pearl", "Pear", "Bunny", "Wind storm", "Skin", "Shin", "Island", "Grotto", "Shore", "Beach", "Coast", "Insect", "Bug", "Critter", "Pristine", "Weather", "Dale", "Dell", "Glade", "Vale", "Basin", "Den", "Valley", "Cyclone", "Typhoon", "Hurricane", "Gale", "Tornado", "Scale", "Whisker", "Bulb", "Stream", "Creature", "Snail", "Vine", "Morning", "Tree", "Chestnut", "Cinnamon", "Olive", "Flax", "Fuchsia", "Goldenrod", "Heliotrope", "Lavender", "Lemon", "Lilac", "Lime", "Mahogany", "Mint", "Moss", "Orange", "Periwinkle", "Plum", "Pumpkin", "Saffron", "Sepia", "Teal", "Birth", "Leap", "Jump", "Dive"];
function generateName() {
    return getRandomName() + ' ' + getRandomName();
    function getRandomName() {
        return words[Math.floor(Math.random() * words.length)];
    }
}
var OptionCard = (function () {
    function OptionCard(name, description) {
        this.name = name;
        this.description = description;
        this.id = OptionCard.nextId++;
    }
    return OptionCard;
}());
OptionCard.nextId = 0;
// TODO: create option cards
OptionCard.RadioControl = new OptionCard('Radio Control', 'TODO...');
OptionCard.All = Object.keys(OptionCard).map(function (x) { return OptionCard[x]; }).filter(function (x) { return x instanceof OptionCard; });
var ProgramCardType;
(function (ProgramCardType) {
    ProgramCardType[ProgramCardType["MOVE"] = 0] = "MOVE";
    ProgramCardType[ProgramCardType["ROTATE"] = 1] = "ROTATE";
})(ProgramCardType || (ProgramCardType = {}));
var ProgramCard = (function () {
    function ProgramCard(type, distance, priority) {
        this.type = type;
        this.distance = distance;
        this.priority = priority;
    }
    ProgramCard.prototype.toString = function () {
        return this.getName() + " (priority " + this.priority + ")";
    };
    ProgramCard.prototype.getName = function () {
        if (this.type == ProgramCardType.MOVE) {
            return "Move " + this.distance;
        }
        else {
            if (this.distance == 1) {
                return "Rotate Right";
            }
            else if (this.distance == -1) {
                return "Rotate Left";
            }
            else {
                return "U-Turn";
            }
        }
    };
    ProgramCard.prototype.toIconName = function () {
        if (this.type == ProgramCardType.MOVE)
            return 'icon-' + (this.distance >= 0 ? 'forward' : 'back-up');
        else
            return 'icon-' + this.getName().replace(' ', '-').toLowerCase();
    };
    ProgramCard.prototype.toHtml = function () {
        var distance = this.type == ProgramCardType.MOVE ? Math.abs(this.distance) : '';
        return "\n<div class=\"collapsedIcon\">\n    <span class=\"" + this.toIconName() + "\"></span><span class=\"distance\">" + (distance > 1 ? distance : '') + "</span>\n</div>\n<span class=\"movement\">\n    <span class=\"" + this.toIconName() + "\"></span><span class=\"amount\">" + distance + "</span>\n</span>\n<span class=\"priority\">\n    <span class=\"icon-bolt\"></span><span class=\"amount\">" + this.priority + "</span>\n</span>";
    };
    /** Useful for sorting. */
    ProgramCard.compare = function (a, b) {
        if (a.type != b.type)
            return b.type - a.type; // first rotate cards, then move cards
        else if (a.distance != b.distance)
            return a.distance - b.distance; // Needed for sorting rotations. Movement distances would actually be caught by the priority sort.
        else
            return a.priority - b.priority;
    };
    return ProgramCard;
}());
var Robot = (function () {
    function Robot(playerID, _position, _orientation, lives, spriteIndex, health) {
        if (spriteIndex === void 0) { spriteIndex = Robot.pickRandomSprite(); }
        if (health === void 0) { health = 10; }
        this.playerID = playerID;
        this._position = _position;
        this._orientation = _orientation;
        this.lives = lives;
        this.maxHealth = 10;
        this.isPoweredDown = false;
        this.optionCards = [];
        this.lockedRegisters = [false, false, false, false, false];
        this.availableProgramCards = [];
        this.registeredProgramCards = [];
        this.lastFlagOrder = 0;
        var pixelPos = _position.toCenterPixelPosition();
        this.sprite = phaserGame.add.sprite(pixelPos.x, pixelPos.y, 'robots');
        this.sprite.angle = _orientation.toDegrees() + 180;
        this.sprite.frame = spriteIndex;
        this.sprite.maxHealth = this.maxHealth;
        this.sprite.health = health;
        this.sprite.anchor.set(0.5);
    }
    Robot.prototype.rotateAsync = function (quarterRotationsCW) {
        var _this = this;
        this._orientation = this._orientation.addTurns(quarterRotationsCW);
        var desiredAngle = this._orientation.toDegrees() + 180;
        var delta = Phaser.Math.wrapAngle(desiredAngle - this.sprite.angle);
        return new Promise(function (resolve) {
            return phaserGame.add.tween(_this.sprite)
                .to({ angle: _this.sprite.angle + delta }, 750, Phaser.Easing.Cubic.InOut, true)
                .onComplete.add(resolve);
        });
    };
    Robot.prototype.moveAsync = function (val) {
        var _this = this;
        this._position = val.clone();
        var pixelPos = val.toCenterPixelPosition();
        this.sprite.visible = true;
        return new Promise(function (resolve) { return phaserGame.add.tween(_this.sprite).to({ x: pixelPos.x, y: pixelPos.y }, 750, Phaser.Easing.Cubic.InOut, true).onComplete.add(resolve); });
    };
    Object.defineProperty(Robot.prototype, "orientation", {
        get: function () {
            return this._orientation;
        },
        enumerable: true,
        configurable: true
    });
    Robot.pickRandomSprite = function () {
        return Math.floor(Math.random() * phaserGame.cache.getFrameCount('robots'));
    };
    Object.defineProperty(Robot.prototype, "health", {
        get: function () {
            return this.sprite.health;
        },
        set: function (val) {
            this.sprite.health = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Robot.prototype, "position", {
        get: function () {
            return this._position.clone();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Robot.prototype, "x", {
        get: function () {
            return this._position.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Robot.prototype, "y", {
        get: function () {
            return this._position.y;
        },
        enumerable: true,
        configurable: true
    });
    Robot.prototype.isDead = function () {
        return this.health <= 0;
    };
    Robot.prototype.dealDamage = function (damageAmount) {
        this.health = Math.max(this.health - damageAmount, 0);
        this.updateLockedRegisters();
    };
    Robot.prototype.healDamage = function (healingAmount) {
        this.health = Math.min(this.health + healingAmount, this.maxHealth);
        this.updateLockedRegisters();
    };
    Robot.prototype.updateLockedRegisters = function () {
        for (var i = 0; i < this.lockedRegisters.length; i++)
            this.lockedRegisters[i] = this.health <= i + 1;
    };
    Robot.prototype.removeFromBoard = function () {
        this._position.x = undefined;
        this._position.y = undefined;
        this.sprite.visible = false;
    };
    return Robot;
}());
var RobotTurn = (function () {
    function RobotTurn(robot, programCards) {
        this.robot = robot;
        this.programCards = programCards;
    }
    return RobotTurn;
}());
//# sourceMappingURL=main.js.map