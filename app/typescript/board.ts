class Board {

    static Instance: Board

    public robots: Robot[] = [];

    public lasers: Laser[] = [];
    public flags: Flag[] = [];

    constructor(public map: Phaser.Tilemap)
    {
        if (Board.Instance != null) {
            throw new Error("Board singleton already exists!");
        }

        Board.Instance = this;

        this.loadBoard();
    }

    private loadBoard() {

        for (let object of this.map.objects['Object Layer']) {

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
    }

    public onPlayerJoined(playerID: PlayerID) {
        var newRobot = new Robot(playerID.id, new BoardPosition(this.robots.length, 0), Direction.S, 3); // TODO: can't start all robots at the same place
        this.robots.push(newRobot);
    }

    public clearRobots() {
        this.robots = [];
    }

    protected moveRobot(robot: Robot, distance: number, direction: Direction) {
        if (distance < 0) {
            throw new Error("Cannot move negative distance!");
        }
        while (distance > 0) {
            distance--;
            try {
                this.attemptMoveRobot(robot, direction);
            } catch (e) {
                // continue attempting to move, so we can animate each attempt
            }
        }
    }

    public getTile(position: Point) {
        if (position && this.isPositionOnBoard(position)) {
            return new BoardTile(this.map, position);
        }
        return null;
    }

    public isPositionOnBoard(position: Point) {
        return position.x < this.map.width &&
               position.x >= 0 &&
               position.y < this.map.height &&
               position.y >= 0;
    }

    protected attemptMoveRobot(robot: Robot, direction: Direction) {
        if (this.hasObstacleInDirection(robot.position, direction)) {
            return false;
        }

        let newPosition = robot.position.getAdjacentPosition(direction);
        let tile: BoardTile = this.getTile(newPosition);
        if ( !tile || tile.isPitTile() ) {
            robot.removeFromBoard();
            return true;
        }

        for (let otherRobot of this.robots) {
            if (otherRobot.position.x == newPosition.x && otherRobot.position.y == newPosition.y) {
                if (!this.attemptMoveRobot(otherRobot, direction)) {
                   return false;
                }
            }
        }
        robot.position = newPosition;
    }

    public hasObstacleInDirection(tilePosition: Point, direction: Direction) {
        let position = new BoardPosition(tilePosition);

        let thisTile: BoardTile = this.getTile(position);
        let nextTile: BoardTile = this.getTile(position.getAdjacentPosition(direction));

        if (thisTile && thisTile.hasObstacleInDirection(direction)) {
            return true;
        } else if (nextTile && nextTile.hasObstacleInDirection(direction.opposite())) {
            return true;
        }

        return false;
    }

    public runRobotProgram(robot: Robot, programAction: ProgramCard) {
        if (!this.isPositionOnBoard(robot.position)) {
            return;
        }
        switch (programAction.type) {
            case ProgramCardType.ROTATE:
                robot.rotate(programAction.distance);
                break;
            case ProgramCardType.MOVE:
                this.moveRobot(robot, Math.abs(programAction.distance), robot.orientation);
                break;
        }
    }

    public executeBoardElements(phase: number) {
        this.runConveyorBelts();
        this.runPushers(phase);
        this.runGears();
    }

    private runConveyorBelts() {
        console.log('Running Conveyor Belts...');
        // move robots that are on conveyor belts
        for (let robot of this.robots) {
            if (!this.isConveyorStationaryBot(robot)) {
                // move onto next tile
                let moveDirection = this.getTile(robot.position).conveyorBeltMovementDirection();

                console.log("Moving robot in (" + robot.position.x + ", " + robot.position.y + ") - Direction: " + moveDirection);
                // perform conveyor rotation
                let newTile = this.getTile(robot.position.getAdjacentPosition(moveDirection));
                this.moveRobotAlongConveyor(robot, moveDirection);
                if (newTile) {
                    let rotation = newTile.conveyorBeltRotationFromDirection(moveDirection.opposite());
                    console.log("Rotation: " + rotation)
                    robot.rotate(rotation);
                }
                
            }
        }
    }

    private moveRobotAlongConveyor(robot: Robot, direction: Direction) {
        let newPosition = robot.position.getAdjacentPosition(direction);
        robot.position = newPosition;
        let tile: BoardTile = this.getTile(newPosition);
        if ( !tile || tile.isPitTile() ) {
            robot.removeFromBoard();
        }
    }

    public isConveyorStationaryBot(robot: Robot) {
        let tile = this.getTile(robot.position);
        let direction = tile.conveyorBeltMovementDirection();
        if (!direction) {
            return true;
        }
        let nextTile = this.getTile(robot.position.getAdjacentPosition(direction));

        if (!tile.isConveyorBelt()) {
            return true;
        } else if (nextTile && nextTile.isConveyorMerge()) {
            let otherTile = nextTile.getOtherConveyorEntrance(tile);
            let otherRobot = this.robotInPosition(otherTile.position);
            if (otherRobot) {
                return this.isConveyorStationaryBot(otherRobot);
            }
        }

        return false;
    }

    public robotInPosition(position: Point) {
        for (let robot of this.robots) {
            if (robot.position.x == position.x && robot.position.y == position.y)
                return robot;
        }
        return false;
    }

    private runPushers(phase: number) {
        for (let robot of this.robots) {
            var tile: Phaser.Tile = this.map.getTile(robot.position.x, robot.position.y, "Wall Layer");
            if (tile == null) {
                continue;
            }

            if (tile.index == 16 && phase % 2 == 1) {
                this.attemptMoveRobot(robot, Direction.fromRadians(tile.rotation + PiOver2));
            }
            else if (tile.index == 17 && phase % 2 == 0) {
                this.attemptMoveRobot(robot, Direction.fromRadians(tile.rotation + PiOver2));
            }
        }
    }

    private runGears() {
        for (let robot of this.robots) {
            var tile: Phaser.Tile = this.map.getTile(robot.position.x, robot.position.y, "Floor Layer");
            if (tile.index == 20) {
                robot.rotate(-1);
            }
            else if (tile.index == 21) {
                robot.rotate(1);
            }
        }
    }

    public fireLasers() {
        for (let laser of this.lasers) {
            laser.fire();
        }
    }

    public touchFlags() {
        for (let flag of this.flags) {
            for (let robot of this.robots) {
                if (robot.position.x == flag.position.x
                    && robot.position.y == flag.position.y) {
                    flag.touchedBy(robot);
                }
            }
        }
    }
}