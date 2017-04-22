var Board = (function () {
    function Board(map) {
        this.map = map;
        if (Board.Instance != null) {
            throw new Error("Board singleton already exists!");
        }
        Board.Instance = this;
        this.loadBoard();
    }
    Board.prototype.loadBoard = function () {
        var _this = this;
        this.map.objects.forEach(function (object) {
            if (object.type == "Laser") {
                var newLaser = new Laser(new BoardPosition(object.x, object.y), DirectionUtil.getDirection(object.rotation), object.count);
                _this.lasers.push(newLaser);
            }
            else if (object.type == "Flag") {
                var newFlag = new Flag(new BoardPosition(object.x, object.y), object.order);
                _this.flags.push(newFlag);
                if (newFlag.order > Flag.highestOrder) {
                    Flag.highestOrder = newFlag.order;
                }
            }
        });
    };
    Board.prototype.addRobot = function (newRobot) {
        this.robots.push(newRobot);
    };
    Board.prototype.turnRobot = function (robot, quarterRotationsCW) {
        robot.orientation = (robot.orientation + quarterRotationsCW) % 4;
        if (robot.orientation < 0) {
            robot.orientation += 4;
        }
    };
    Board.prototype.moveRobot = function (robot, distance, direction) {
        if (distance < 0) {
            throw new Error("Cannot move negatice distance!");
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
    Board.prototype.getTileType = function (position) {
        return '';
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
            throw new Error("Cannot move robot! Obstacle in the way.");
        }
        var newPosition = this.getAdjacentBoardPosition(robot.position, direction);
        if (!this.isPositionOnBoard(newPosition) || this.getTileType(newPosition) == "Pit") {
            robot.removeFromBoard();
            return;
        }
        for (var _i = 0, _a = this.robots; _i < _a.length; _i++) {
            var otherRobot = _a[_i];
            if (otherRobot.position.x == newPosition.x && otherRobot.position.y == newPosition.y) {
                try {
                    this.attemptMoveRobot(otherRobot, direction);
                    robot.position = newPosition;
                }
                catch (e) {
                }
            }
        }
    };
    Board.prototype.getAdjacentBoardPosition = function (fromPosition, direction) {
        switch (direction) {
            case Direction.N:
                return new BoardPosition(fromPosition.x, fromPosition.y + 1);
            case Direction.E:
                return new BoardPosition(fromPosition.x + 1, fromPosition.y);
            case Direction.S:
                return new BoardPosition(fromPosition.x, fromPosition.y - 1);
            case Direction.N:
                return new BoardPosition(fromPosition.x - 1, fromPosition.y);
        }
    };
    Board.prototype.hasObstacleInDirection = function (fromPosition, direction) {
        // figure out if there are any permanent obstacles preventing progress in a certain direction
        return true;
    };
    Board.prototype.runRobotProgram = function (robot, programAction) {
        switch (programAction.type) {
            case ProgramCardType.ROTATE:
                this.turnRobot(robot, programAction.distance);
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
    Board.prototype.executeBoardElements = function () {
        // TODO:
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
var BoardPosition = (function () {
    function BoardPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    return BoardPosition;
}());
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
        return angleInDegrees / 90;
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
var Laser = (function () {
    function Laser(position, facingDirection, damagePower) {
        this.position = position;
        this.facingDirection = facingDirection;
        this.damagePower = damagePower;
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
        closestFacingRobot.dealDamage(this.damagePower);
    };
    return Laser;
}());
/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>
var game, map;
function preload() {
    game.load.baseURL = 'https://cdn.glitch.com/';
    game.load.crossOrigin = 'anonymous';
    game.load.image('laser', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FLaser%20Small.png?1491971767592');
    game.load.image('tileset', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FSpritesheet%20Small.png?1491966800433');
    game.load.tilemap('tilemap', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FCross.json?1491966835347', null, Phaser.Tilemap.TILED_JSON);
}
function create() {
    map = game.add.tilemap('tilemap');
    map.addTilesetImage('RoboRallyOriginal', 'tileset');
    map.createLayer('Tile Layer 1').resizeWorld();
    map.createLayer('Tile Layer 2');
}
function startGame() {
    game = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: preload, create: create });
}
function loadGame(id) {
    if (!localStorage['Game_' + id])
        return null;
    var data = JSON.parse(localStorage['Game_' + id]);
    socket.emit('join', { id: id, name: data.name, isHost: data.isHost });
    // TODO: load state
    return data;
}
function saveGame() {
    var data = {};
    // TODO: get game state
    if (data["id"])
        localStorage['Game_' + data["id"]] = JSON.stringify(data);
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
    return ProgramCard;
}());
var ProgramCardType;
(function (ProgramCardType) {
    ProgramCardType[ProgramCardType["MOVE"] = 0] = "MOVE";
    ProgramCardType[ProgramCardType["ROTATE"] = 1] = "ROTATE";
})(ProgramCardType || (ProgramCardType = {}));
var Robot = (function () {
    function Robot(position, orientation, lives, health) {
        this.position = position;
        this.orientation = orientation;
        this.lives = lives;
        this.health = health;
        this.maxHealth = 9;
        if (health == undefined) {
            this.health = 9;
        }
        this.isPoweredDown = false;
        this.optionCards = [];
        this.lockedRegisters = [];
        this.availableProgramCards = [];
        this.registeredProgramCards = [];
        this.lastFlagOrder = 0;
    }
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
    };
    Robot.prototype.healDamage = function (healingAmount) {
        if (this.health + healingAmount >= this.maxHealth) {
            this.health = this.maxHealth;
        }
        else {
            this.health += healingAmount;
        }
    };
    Robot.prototype.removeFromBoard = function () {
        this.position.x = undefined;
        this.position.y = undefined;
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
var TurnLogic = (function () {
    function TurnLogic() {
        this.numPhases = 5;
    }
    TurnLogic.prototype.run = function (turns) {
        // Execute each phase, one at a time
        for (var i = 0; i < this.numPhases; i++) {
            // For each phase, we collect the action each robot will perform into an array of RobotPhaseAction objects.
            // We then execute the actions in priority order.
            var robotMovements = [];
            for (var _i = 0, turns_1 = turns; _i < turns_1.length; _i++) {
                var turn = turns_1[_i];
                robotMovements.push(new RobotPhaseMovement(turn.robot, turn.programCards[i]));
            }
            this.runRobotMovements(robotMovements);
            Board.Instance.executeBoardElements();
            Board.Instance.fireLasers();
            Board.Instance.touchFlags();
        }
    };
    TurnLogic.prototype.runRobotMovements = function (robotMovements) {
        this.sortRobotMovements(robotMovements);
        for (var _i = 0, robotMovements_1 = robotMovements; _i < robotMovements_1.length; _i++) {
            var movement = robotMovements_1[_i];
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