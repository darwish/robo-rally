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
                var newLaser = new Laser(position, DirectionUtil.getDirection(object.rotation), object.count);
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
        var newRobot = new Robot(playerID.id, new BoardPosition(this.robots.length, 0), 0, 3); // TODO: can't start all robots at the same place
        this.robots.push(newRobot);
    };
    Board.prototype.clearRobots = function () {
        this.robots = [];
    };
    Board.prototype.moveRobot = function (robot, distance, direction) {
        if (distance < 0) {
            throw new Error("Cannot move negative distance!");
        }
        while (distance > 0) {
            distance--;
            try {
                this.attemptMoveRobot(robot, direction);
            }
            catch (e) {
            }
        }
    };
    Board.prototype.getTile = function (position) {
        if (this.isPositionOnBoard(position)) {
            return new BoardTile(this.map, position);
        }
        return null;
    };
    Board.prototype.isPositionOnBoard = function (position) {
        if (position.x < this.map.width &&
            position.x >= 0 &&
            position.y < this.map.height &&
            position.y >= 0) {
            return true;
        }
        return false;
    };
    Board.prototype.attemptMoveRobot = function (robot, direction) {
        if (this.hasObstacleInDirection(robot.position, direction)) {
            return false;
        }
        var newPosition = robot.position.getAdjacentPosition(direction);
        var tile = this.getTile(newPosition);
        if (!tile || tile.isPitTile()) {
            robot.removeFromBoard();
            return true;
        }
        for (var _i = 0, _a = this.robots; _i < _a.length; _i++) {
            var otherRobot = _a[_i];
            if (otherRobot.position.x == newPosition.x && otherRobot.position.y == newPosition.y) {
                if (!this.attemptMoveRobot(otherRobot, direction)) {
                    return false;
                }
            }
        }
        robot.position = newPosition;
    };
    Board.prototype.hasObstacleInDirection = function (tilePosition, direction) {
        var thisTile = this.getTile(tilePosition);
        var nextTile = this.getTile(tilePosition.getAdjacentPosition(direction));
        if (thisTile && thisTile.hasObstacleInDirection(direction)) {
            return true;
        }
        else if (nextTile && nextTile.hasObstacleInDirection(DirectionUtil.opposite(direction))) {
            return true;
        }
        return false;
    };
    Board.prototype.runRobotProgram = function (robot, programAction) {
        if (!this.isPositionOnBoard(robot.position)) {
            return;
        }
        switch (programAction.type) {
            case ProgramCardType.ROTATE:
                robot.rotate(programAction.distance);
                break;
            case ProgramCardType.MOVE:
                var orientation_1 = robot.orientation;
                if (programAction.distance < 0) {
                    orientation_1 = (robot.orientation + 4) % 4;
                }
                this.moveRobot(robot, Math.abs(programAction.distance), orientation_1);
                break;
        }
    };
    Board.prototype.executeBoardElements = function (phase) {
        this.runConveyorBelts();
        this.runPushers(phase);
        this.runGears();
    };
    Board.prototype.runConveyorBelts = function () {
        // move robots that are on conveyor belts
        for (var _i = 0, _a = this.robots; _i < _a.length; _i++) {
            var robot = _a[_i];
            if (!this.isConveyorStationaryBot(robot)) {
                // move onto next tile
                var moveDirection = this.getTile(robot.position).conveyorBeltMovementDirection();
                this.moveRobotAlongConveyor(robot, moveDirection);
                // perform conveyor rotation
                var newTile = this.getTile(robot.position.getAdjacentPosition(moveDirection));
                robot.rotate(newTile.conveyorBeltRotationFromDirection(DirectionUtil.opposite(moveDirection)));
            }
        }
    };
    Board.prototype.moveRobotAlongConveyor = function (robot, direction) {
        var newPosition = robot.position.getAdjacentPosition(direction);
        var tile = this.getTile(newPosition);
        if (!tile || tile.isPitTile()) {
            robot.removeFromBoard();
        }
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
        else if (nextTile.isConveyorMerge()) {
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
            if (robot.position.x == position.x && robot.position.y == position.y) {
                return robot;
            }
        }
        return false;
    };
    Board.prototype.runPushers = function (phase) {
        for (var _i = 0, _a = this.robots; _i < _a.length; _i++) {
            var robot = _a[_i];
            var tile = this.map.getTile(robot.position.x, robot.position.y, "Wall Layer");
            if (tile == null) {
                continue;
            }
            if (tile.index == 16 && phase % 2 == 1) {
                this.attemptMoveRobot(robot, DirectionUtil.getDirection(tile.rotation + 90));
            }
            else if (tile.index == 17 && phase % 2 == 0) {
                this.attemptMoveRobot(robot, DirectionUtil.getDirection(tile.rotation + 90));
            }
        }
    };
    Board.prototype.runGears = function () {
        for (var _i = 0, _a = this.robots; _i < _a.length; _i++) {
            var robot = _a[_i];
            var tile = this.map.getTile(robot.position.x, robot.position.y, "Floor Layer");
            if (tile.index == 20) {
                robot.rotate(-1);
            }
            else if (tile.index == 21) {
                robot.rotate(1);
            }
        }
    };
    Board.prototype.fireLasers = function () {
        for (var _i = 0, _a = this.lasers; _i < _a.length; _i++) {
            var laser = _a[_i];
            laser.fire();
        }
    };
    Board.prototype.touchFlags = function () {
        for (var _i = 0, _a = this.flags; _i < _a.length; _i++) {
            var flag = _a[_i];
            for (var _b = 0, _c = this.robots; _b < _c.length; _b++) {
                var robot = _c[_b];
                if (robot.position.x == flag.position.x
                    && robot.position.y == flag.position.y) {
                    flag.touchedBy(robot);
                }
            }
        }
    };
    return Board;
}());
var BoardPosition = (function (_super) {
    __extends(BoardPosition, _super);
    function BoardPosition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoardPosition.prototype.getAdjacentPosition = function (direction) {
        switch (direction) {
            case Direction.N:
                return new BoardPosition(this.x, this.y + 1);
            case Direction.E:
                return new BoardPosition(this.x + 1, this.y);
            case Direction.S:
                return new BoardPosition(this.x, this.y - 1);
            case Direction.N:
                return new BoardPosition(this.x - 1, this.y);
        }
    };
    /** Returns the center of the tile in pixel coordinates. */
    BoardPosition.prototype.toCenterPixelPosition = function () {
        var tile = map.getTile(this.x, this.y);
        return new Phaser.Point(tile.centerX + tile.worldX, tile.centerY + tile.worldY);
    };
    /** Returns the top left of the tile in pixel coordinates. */
    BoardPosition.prototype.toPixelPosition = function () {
        var tile = map.getTile(this.x, this.y);
        return new Phaser.Point(tile.worldX, tile.worldY);
    };
    BoardPosition.prototype.clone = function () {
        return new BoardPosition(this.x, this.y);
    };
    return BoardPosition;
}(Phaser.Point));
var BoardTile = (function () {
    function BoardTile(map, position) {
        this.map = map;
        this.position = position;
    }
    BoardTile.prototype.getPhaserTile = function (layerName) {
        return this.map.getTile(this.position.x, this.position.y, layerName);
    };
    BoardTile.prototype.isPitTile = function () {
        var tile = this.getPhaserTile("Floor Layer");
        switch (tile.index) {
            case 14:
            case 15:
            case 18:
            case 19:
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
            case 2:
            case 3:
            case 6:
            case 7:
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
            case 0:
            case 1:
            case 4:
            case 5:
                return [
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.W, tile.rotation))
                ];
            case 2:
            case 6:
                return [
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.W, tile.rotation)),
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.S, tile.rotation))
                ];
            case 3:
            case 7:
                return [
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.N, tile.rotation)),
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.S, tile.rotation))
                ];
        }
    };
    BoardTile.prototype.hasObstacleInDirection = function (direction) {
        var tile = this.getPhaserTile("Wall Layer");
        if (tile == null) {
            return false;
        }
        if (tile.index == 12
            && (DirectionUtil.getDirection(tile.rotation) == direction || DirectionUtil.getDirection(tile.rotation + 90) == direction)) {
            return true;
        }
        else if (tile.index == 13
            && DirectionUtil.getDirection(tile.rotation) == direction) {
            return true;
        }
        else if ((tile.index == 16 || tile.index == 17)
            && DirectionUtil.getDirection(tile.rotation + 90) == direction) {
            return true;
        }
        return false;
    };
    BoardTile.prototype.conveyorBeltRotationFromDirection = function (direction) {
        if (this.isConveyorBelt()) {
            var phaserTile = this.getPhaserTile("Floor Layer");
            if (phaserTile.index == 1 || phaserTile.index == 5) {
                // rotates left from West
                if (DirectionUtil.rotateDirection(Direction.W, phaserTile.rotation) == direction) {
                    return -1;
                }
            }
            else if (phaserTile.index == 2 || phaserTile.index == 6) {
                // rotates right from South
                if (DirectionUtil.rotateDirection(Direction.S, phaserTile.rotation) == direction) {
                    return 1;
                }
            }
            else if (phaserTile.index == 3 || phaserTile.index == 7) {
                // rotates left from North
                if (DirectionUtil.rotateDirection(Direction.N, phaserTile.rotation) == direction) {
                    return -1;
                }
                // rotates right from South
                if (DirectionUtil.rotateDirection(Direction.S, phaserTile.rotation) == direction) {
                    return 1;
                }
            }
        }
        return 0;
    };
    BoardTile.prototype.conveyorBeltMovementDirection = function () {
        if (this.isConveyorBelt()) {
            var phaserTile = this.getPhaserTile("Floor Layer");
            switch (phaserTile.index) {
                case 0:
                case 2:
                case 3:
                case 4:
                case 6:
                case 7:
                    return DirectionUtil.rotateDirection(Direction.E, phaserTile.rotation);
                case 1:
                case 5:
                    return DirectionUtil.rotateDirection(Direction.N, phaserTile.rotation);
            }
        }
    };
    return BoardTile;
}());
var CardDeck = (function () {
    function CardDeck(cards) {
        this.cards = cards;
    }
    CardDeck.newDeck = function () {
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
    CardDeck.prototype.deal = function (handSizes) {
        this.shuffle();
        var hands = [];
        for (var _i = 0, handSizes_1 = handSizes; _i < handSizes_1.length; _i++) {
            var size = handSizes_1[_i];
            hands.push(this.cards.splice(0, size));
        }
        return hands;
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
var Direction;
(function (Direction) {
    // increasing CW from North
    Direction[Direction["N"] = 0] = "N";
    Direction[Direction["E"] = 1] = "E";
    Direction[Direction["S"] = 2] = "S";
    Direction[Direction["W"] = 3] = "W";
})(Direction || (Direction = {}));
var DirectionUtil = (function () {
    function DirectionUtil() {
    }
    DirectionUtil.getDirection = function (angleInDegrees) {
        while (angleInDegrees < 0) {
            angleInDegrees += 360;
        }
        return angleInDegrees / 90 % 360;
    };
    DirectionUtil.clamp = function (direction) {
        while (direction < 0) {
            direction += 4;
        }
        return direction % 4;
    };
    DirectionUtil.opposite = function (direction) {
        return DirectionUtil.clamp(direction + 2);
    };
    DirectionUtil.toDegrees = function (direction) {
        switch (direction) {
            case Direction.N:
                return 0;
            case Direction.E:
                return 90;
            case Direction.S:
                return 180;
            case Direction.W:
                return 270;
        }
    };
    DirectionUtil.rotateDirection = function (direction, angleInDegrees) {
        return this.getDirection(this.toDegrees(direction) + angleInDegrees);
    };
    return DirectionUtil;
}());
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
        this.facingDirection = facingDirection;
        this.damagePower = damagePower;
        var pixelPos = position.toPixelPosition();
        this.sprite = phaserGame.add.sprite(pixelPos.x, pixelPos.y, 'laser-emitter');
        this.sprite.angle = DirectionUtil.toDegrees(facingDirection);
    }
    Laser.prototype.fire = function () {
        var robots = Board.Instance.robots;
        var closestFacingRobot = null;
        for (var i = 0; i < robots.length; i++) {
            if (this.facingDirection == Direction.E
                && robots[i].position.y == this.position.y
                && robots[i].position.x >= this.position.x
                && (closestFacingRobot == null || robots[i].position.x < closestFacingRobot.x)) {
                closestFacingRobot = robots[i];
            }
            else if (this.facingDirection == Direction.W
                && robots[i].position.y == this.position.y
                && robots[i].position.x <= this.position.x
                && (closestFacingRobot == null || robots[i].position.x > closestFacingRobot.x)) {
                closestFacingRobot = robots[i];
            }
            else if (this.facingDirection == Direction.N
                && robots[i].position.x == this.position.x
                && robots[i].position.y >= this.position.y
                && (closestFacingRobot == null || robots[i].position.y < closestFacingRobot.y)) {
                closestFacingRobot = robots[i];
            }
            else if (this.facingDirection == Direction.S
                && robots[i].position.x == this.position.x
                && robots[i].position.y <= this.position.y
                && (closestFacingRobot == null || robots[i].position.y > closestFacingRobot.y)) {
                closestFacingRobot = robots[i];
            }
        }
        if (closestFacingRobot) {
            closestFacingRobot.dealDamage(this.damagePower);
            laserProjectile.fire(this.position, closestFacingRobot.position.x, closestFacingRobot.position.y);
        }
    };
    return Laser;
}());
/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>
var phaserGame, map, board, laserProjectile;
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
        this.turnLogic = null;
        this.globalCardDeck = CardDeck.newDeck();
    }
    Main.prototype.preload = function () {
        phaserGame.load.baseURL = '/';
        //phaserGame.load.crossOrigin = 'anonymous';
        phaserGame.load.image('laser-emitter', 'images/Laser%20Small.png');
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
        map.createLayer('Wall Layer');
        laserProjectile = phaserGame.add.weapon(-1, 'laser-projectile');
        laserProjectile.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        laserProjectile.bulletSpeed = 400;
        board = new Board(map);
        initRoboRally();
    };
    Main.prototype.update = function () {
        if (this.gameState == GameState.PlayingActions) {
            if (this.turnLogic != null) {
                if (this.turnLogic.isDoneAllPhases()) {
                    this.startNewTurn();
                }
                else {
                    this.turnLogic.update();
                }
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
            _this.checkForAllPlayerSubmissions();
        });
    };
    Main.prototype.showCards = function (cards) {
        $('.statusText').html('Choose Your Cards');
        $('.cardContainer').empty();
        cards.forEach(function (card) {
            var cardChoice = $('<li class="cardChoice">' + card.toString() + '</li>');
            cardChoice.data('card', card);
            $('.cardContainer').append(cardChoice);
        });
    };
    Main.prototype.dealCards = function (handSizes) {
        return this.globalCardDeck.deal(handSizes);
    };
    Main.prototype.chooseCard = function (element) {
        var card = $(element).data('card');
        if ($(element).hasClass('selected')) {
            this.selectedCards.splice(this.selectedCards.indexOf(card), 1);
            $(element).removeClass('selected');
            $('.submitCards').addClass('hidden');
        }
        else {
            if (this.selectedCards.length < 5) {
                this.selectedCards.push(card);
                $(element).addClass('selected');
                if (this.selectedCards.length == 5) {
                    $('.submitCards').removeClass('hidden');
                }
                else {
                    $('.submitCards').addClass('hidden');
                }
            }
        }
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
        this.checkForAllPlayerSubmissions();
    };
    Main.prototype.checkForAllPlayerSubmissions = function () {
        if (Object.keys(this.playerSubmittedCards).length == clientGame.getPlayers().length) {
            this.gameState = GameState.PlayingActions;
            var turns = [];
            var _loop_1 = function (clientId) {
                robot = Board.Instance.robots.filter(function (r) { return r.playerID == clientId; })[0];
                turns.push(new RobotTurn(robot, this_1.playerSubmittedCards[clientId]));
            };
            var this_1 = this, robot;
            for (var clientId in this.playerSubmittedCards) {
                _loop_1(clientId);
            }
            this.turnLogic = new TurnLogic(turns);
        }
    };
    return Main;
}());
var main;
function startGame() {
    main = new Main();
    phaserGame = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: function () { return main.preload(); }, create: function () { return main.create(); }, update: function () { return main.update(); } });
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
var words = ["Berry", "Blossom", "Bride", "Butterfly", "Candy", "Couple", "Cream", "Dear", "Dress", "Dumpling", "Flower", "Flute", "Girdle", "Glimmer", "Glisten", "Gloss", "Honey", "Incense", "Knit", "Lace", "Lark", "Lute", "Lyric", "Meadow", "Mellow", "Mother", "Music", "Nestle", "Nurture", "Pregnant", "Prim", "Queen", "Satin", "Sheen", "Show", "Silk", "Silky", "Sing", "Sister", "Skirt", "Skirt", "Smile", "Style", "Sugar", "Sweet", "Trim", "Tulip", "Tweet", "Velvet", "Wavy", "Wisp", "Wonder", "Dessert", "Fancy", "Lather", "Petal", "Droplet", "Pantomime", "Fragrance", "Glitter", "Sparkle", "Tragedy", "Cyclopean", "Trifle", "Luxury", "Euphoria", "Scintillate", "Sensual", "Malodorous", "Venerate", "Tress", "Ensorcel", "Fabulous", "Mirth", "Laconic", "Quiescent", "Reticent", "Saturnine", "Taciturn", "Fortuitous", "Tenebrous", "Morose", "Beloved", "Suitor", "Pungent", "Cherish", "Pristine", "Languish", "Adore", "Embrace", "Meander", "Bewilder", "Intricate", "Poem", "Poetry", "Poet", "Amethyst", "Aquamarine", "Azure", "Beige", "Sienna", "Umber", "Cardinal", "Carmine", "Cerulean", "Chartreuse", "Fuchsia", "Goldenrod", "Heliotrope", "Lavender", "Lilac", "Mauve", "Taupe", "Periwinkle", "Russet", "Saffron", "Vermilion", "Festival", "Animal", "Ape", "Autumn", "Beak", "Beast", "Bear", "Bee", "Beetle", "Berry", "Bird", "Blaze", "Blossom", "Boar", "Bog", "Buck", "Bush", "Butterfly", "Buzzard", "Canyon", "Cat", "Chill", "Chirp", "Clam", "Clearing", "Cobra", "Crab", "Creek", "Crow", "Dawn", "Deer", "Dirt", "Dusk", "Eagle", "Eel", "Fang", "Fin", "Fish", "Flower", "Fog", "Forest", "Frog", "Fruit", "Fungus", "Fur", "Gerbil", "Glen", "Gore", "Gorge", "Grape", "Grass", "Grove", "Grow", "Growl", "Growth", "Grub", "Hare", "Hawk", "Heather", "Hedge", "Hide", "Hill", "Hoary", "Hog", "Hoof", "Hop", "Horn", "Howl", "Ivy", "Jackal", "Jaw", "Jungle", "Kitten", "Lake", "Lark", "Larva", "Leaf", "Leopard", "Lizard", "Lobster", "Lush", "Maggot", "Mange", "Marsh", "Maw", "Meadow", "Mist", "Mite", "Mold", "Mole", "Monkey", "Moth", "Mud", "Mushroom", "Nature", "Nest", "Nettle", "Newt", "Nut", "Oak", "Owl", "Pack", "Panther", "Peach", "Plant", "Planter", "Rabbit", "Rain", "Ram", "Raptor", "Rat", "Raven", "Ripe", "River", "Rock", "Root", "Rose", "Sap", "Scorpion", "Sea", "Seal", "Season", "Seed", "Serpent", "Shark", "Shell", "Silt", "Skunk", "Sky", "Slither", "Slug", "Snake", "Soil", "Spider", "Spidery", "Spring", "Squid", "Stick", "Stone", "Storm", "Straw", "Summer", "Sun", "Swamp", "Tail", "Talon", "Tempest", "Thorn", "Thunder", "Tick", "Toad", "Tulip", "Tusk", "Tweet", "Twilight", "Vegetable", "Vegetation", "Viper", "Volcano", "Vulture", "Wasp", "Wave", "Weasel", "Weed", "Wheat", "Wing", "Winter", "Wood", "Worm", "Earth", "Bud", "Desert", "Field", "Glacier", "Mountain", "Prairie", "Tentacle", "Tundra", "Weevil", "Dune", "Pine", "Puppy", "Gnarled", "Stump", "Beard", "Water", "Wax", "Roar", "Ford", "Snarl", "Drink", "Flight", "Twig", "Tuft", "Fern", "Gully", "Lion", "Cactus", "Cloud", "Bean", "Pearl", "Pear", "Bunny", "Wind storm", "Skin", "Shin", "Island", "Grotto", "Shore", "Beach", "Coast", "Insect", "Bug", "Critter", "Pristine", "Weather", "Dale", "Dell", "Glade", "Vale", "Basin", "Den", "Valley", "Cyclone", "Typhoon", "Hurricane", "Gale", "Tornado", "Scale", "Whisker", "Bulb", "Stream", "Creature", "Snail", "Vine", "Morning", "Tree", "Chestnut", "Cinnamon", "Olive", "Flax", "Fuchsia", "Goldenrod", "Heliotrope", "Lavender", "Lemon", "Lilac", "Lime", "Mahogany", "Mint", "Moss", "Orange", "Periwinkle", "Plum", "Pumpkin", "Saffron", "Sepia", "Teal", "Birth", "Leap", "Jump", "Dive"];
function generateName() {
    return getRandomName() + ' ' + getRandomName();
    function getRandomName() {
        return words[Math.floor(Math.random() * words.length)];
    }
}
var OptionCard = (function () {
    function OptionCard() {
    }
    return OptionCard;
}());
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
    return ProgramCard;
}());
var ProgramCardType;
(function (ProgramCardType) {
    ProgramCardType[ProgramCardType["MOVE"] = 0] = "MOVE";
    ProgramCardType[ProgramCardType["ROTATE"] = 1] = "ROTATE";
})(ProgramCardType || (ProgramCardType = {}));
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
        this.sprite.frame = spriteIndex;
        this.sprite.maxHealth = this.maxHealth;
        this.sprite.health = health;
        this.sprite.anchor.set(0.5);
    }
    Robot.prototype.rotate = function (quarterRotationsCW) {
        this._orientation = DirectionUtil.clamp(this._orientation + quarterRotationsCW);
        phaserGame.add.tween(this.sprite).to({ angle: DirectionUtil.toDegrees(this._orientation) }, 750, Phaser.Easing.Cubic.InOut, true);
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
        set: function (val) {
            this._position = val.clone();
            var pixelPos = val.toCenterPixelPosition();
            phaserGame.add.tween(this.sprite).to({ x: pixelPos.x, y: pixelPos.y }, 750, Phaser.Easing.Cubic.InOut, true);
            this.sprite.visible = true;
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
        if (this.health - damageAmount <= 0) {
            this.health = 0;
        }
        else {
            this.health -= damageAmount;
        }
        this.updateLockedRegisters();
    };
    Robot.prototype.healDamage = function (healingAmount) {
        if (this.health + healingAmount >= this.maxHealth) {
            this.health = this.maxHealth;
        }
        else {
            this.health += healingAmount;
        }
        this.updateLockedRegisters();
    };
    Robot.prototype.updateLockedRegisters = function () {
        this.lockedRegisters = [true, true, true, true, true];
        if (this.health > 1) {
            this.lockedRegisters[0] = false;
        }
        if (this.health > 2) {
            this.lockedRegisters[1] = false;
        }
        if (this.health > 3) {
            this.lockedRegisters[2] = false;
        }
        if (this.health > 4) {
            this.lockedRegisters[3] = false;
        }
        if (this.health > 5) {
            this.lockedRegisters[4] = false;
        }
    };
    Robot.prototype.removeFromBoard = function () {
        this._position.x = undefined;
        this._position.y = undefined;
        this.sprite.visible = false;
    };
    return Robot;
}());
var RobotPhaseMovement = (function () {
    function RobotPhaseMovement(robot, programCard) {
        this.robot = robot;
        this.programCard = programCard;
    }
    return RobotPhaseMovement;
}());
var RobotTurn = (function () {
    function RobotTurn(robot, programCards) {
        this.robot = robot;
        this.programCards = programCards;
    }
    return RobotTurn;
}());
var TurnState;
(function (TurnState) {
    TurnState[TurnState["RobotMovement"] = 0] = "RobotMovement";
    TurnState[TurnState["BoardMovement"] = 1] = "BoardMovement";
    TurnState[TurnState["Lasers"] = 2] = "Lasers";
    TurnState[TurnState["Flags"] = 3] = "Flags";
})(TurnState || (TurnState = {}));
var TurnLogic = (function () {
    function TurnLogic(turnsData) {
        this.turnsData = turnsData;
        this.PHASE_COUNT = 5;
        this.turnState = TurnState.RobotMovement;
        this.nextTurnPhaseStepTime = 0;
        this.phaseNumber = 0;
    }
    TurnLogic.prototype.isDoneAllPhases = function () {
        return this.phaseNumber >= this.PHASE_COUNT;
    };
    TurnLogic.prototype.update = function () {
        if (phaserGame.time.now >= this.nextTurnPhaseStepTime) {
            if (this.turnState == TurnState.RobotMovement) {
                this.runNextTurnPhase_RobotMovements();
                this.nextTurnPhaseStepTime = phaserGame.time.now + 1000;
                this.turnState = TurnState.BoardMovement;
            }
            else if (this.turnState == TurnState.BoardMovement) {
                Board.Instance.executeBoardElements(this.phaseNumber);
                this.nextTurnPhaseStepTime = phaserGame.time.now + 1000;
                this.turnState = TurnState.Lasers;
            }
            else if (this.turnState == TurnState.Lasers) {
                Board.Instance.fireLasers();
                this.nextTurnPhaseStepTime = phaserGame.time.now + 1000;
                this.turnState = TurnState.Flags;
            }
            else if (this.turnState == TurnState.Flags) {
                Board.Instance.touchFlags();
                this.nextTurnPhaseStepTime = phaserGame.time.now + 1000;
                this.turnState = TurnState.RobotMovement;
                this.phaseNumber++;
            }
        }
    };
    TurnLogic.prototype.runNextTurnPhase_RobotMovements = function () {
        var robotMovements = [];
        for (var _i = 0, _a = this.turnsData; _i < _a.length; _i++) {
            var turn = _a[_i];
            robotMovements.push(new RobotPhaseMovement(turn.robot, turn.programCards[this.phaseNumber]));
        }
        this.sortRobotMovements(robotMovements);
        for (var _b = 0, robotMovements_1 = robotMovements; _b < robotMovements_1.length; _b++) {
            var movement = robotMovements_1[_b];
            this.tryExecuteRobotMovement(movement);
        }
    };
    TurnLogic.prototype.tryExecuteRobotMovement = function (robotMovement) {
        if (!robotMovement.robot.isDead()) {
            Board.Instance.runRobotProgram(robotMovement.robot, robotMovement.programCard);
        }
    };
    TurnLogic.prototype.sortRobotMovements = function (movements) {
        movements.sort(function (a, b) {
            return b.programCard.priority - a.programCard.priority;
        });
    };
    return TurnLogic;
}());
//# sourceMappingURL=main.js.map