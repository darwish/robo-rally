class Board {
    private static readonly PHASE_COUNT = 5;
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

    public async runTurnAsync(turnsData: RobotTurn[]) {
        for (let i = 0; i < Board.PHASE_COUNT; i++) {
            await this.runRobotMovementAsync(turnsData, i);
            await this.executeBoardElementsAsync(i);
            await this.fireLasersAsync();
            await this.touchFlagsAsync();
        }
    }

    private async runRobotMovementAsync(turnsData: RobotTurn[], phaseNumber: number) {
        let movements = turnsData.filter(x => !x.robot.isDead())
            .map(x => ({ robot: x.robot, programCard: x.programCards[phaseNumber] }))
            .sort((a, b) => b.programCard.priority - a.programCard.priority);

        for (let movement of movements)
            await this.runRobotProgram(movement.robot, movement.programCard);
    }

    protected async moveRobot(robot: Robot, distance: number, direction: Direction) {
        distance = Math.round(distance);    // just in case
        if (distance < 0)
            direction = direction.opposite();

        while (distance !== 0) {
            distance -= Math.sign(distance);
            try {
                await this.moveRobotOneTile(robot, direction);
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

    protected canMoveRobot(robot: Robot, direction: Direction): boolean {
        if (this.hasObstacleInDirection(robot.position, direction)) {
            return false;
        }

        let newPosition = robot.position.getAdjacentPosition(direction);
        let tile: BoardTile = this.getTile(newPosition);
        if (!tile || tile.isPitTile()) {
            return true;
        }

        let pushedRobot = this.robots.filter(x => x.position.equals(newPosition))[0];
        
        return !pushedRobot || this.canMoveRobot(pushedRobot, direction);
    }

    protected async moveRobotOneTile(robot: Robot, direction: Direction) {
        if (!this.canMoveRobot(robot, direction)) {
            return;
        }

        let newPosition = robot.position.getAdjacentPosition(direction);
        let tile: BoardTile = this.getTile(newPosition);
        if (!tile || tile.isPitTile()) {
            robot.removeFromBoard();
            return;
        }

        let pushedRobot = this.robots.filter(x => x.position.equals(newPosition))[0];
        if (pushedRobot)
            await Promise.all([this.moveRobotOneTile(pushedRobot, direction), robot.moveAsync(newPosition)]);
        else
            await robot.moveAsync(newPosition);
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

    public async runRobotProgram(robot: Robot, programAction: ProgramCard) {
        if (!this.isPositionOnBoard(robot.position)) {
            return;
        }
        switch (programAction.type) {
            case ProgramCardType.ROTATE:
                await robot.rotateAsync(programAction.distance);
                break;
            case ProgramCardType.MOVE:
                await this.moveRobot(robot, programAction.distance, robot.orientation);
                break;
        }
    }

    public async executeBoardElementsAsync(phase: number) {
        await this.runConveyorBeltsAsync();
        await this.runPushersAsync(phase);
        await this.runGearsAsync();
    }

    private async runConveyorBeltsAsync() {
        console.log('Running Conveyor Belts...');
        // move robots that are on conveyor belts
        for (let robot of this.robots) {
            if (!this.isConveyorStationaryBot(robot)) {
                // move onto next tile
                let moveDirection = this.getTile(robot.position).conveyorBeltMovementDirection();

                console.log("Moving robot in (" + robot.position.x + ", " + robot.position.y + ") - Direction: " + moveDirection);
                // perform conveyor rotation
                let newTile = this.getTile(robot.position.getAdjacentPosition(moveDirection));
                this.moveRobotAlongConveyorAsync(robot, moveDirection);
                if (newTile) {
                    let rotation = newTile.conveyorBeltRotationFromDirection(moveDirection.opposite());
                    console.log("Rotation: " + rotation)
                    await robot.rotateAsync(rotation);
                }
                
            }
        }
    }

    private async moveRobotAlongConveyorAsync(robot: Robot, direction: Direction) {
        let newPosition = robot.position.getAdjacentPosition(direction);
        await robot.moveAsync(newPosition);
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
            if (robot.position.equals(position))
                return robot;
        }
        return null;
    }

    private async runPushersAsync(phase: number) {
        let promises: Promise<void>[] = [];

        for (let robot of this.robots) {
            var tile: Phaser.Tile = this.map.getTile(robot.position.x, robot.position.y, "Wall Layer");
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

        await Promise.all(promises);
    }

    private async runGearsAsync() {
        let promises: Promise<void>[] = [];

        for (let robot of this.robots) {
            var tile: Phaser.Tile = this.map.getTile(robot.position.x, robot.position.y, "Floor Layer");
            if (tile.index == Tiles.GearCCW) {
                promises.push(robot.rotateAsync(-1));
            }
            else if (tile.index == Tiles.GearCW) {
                promises.push(robot.rotateAsync(1));
            }
        }

        await Promise.all(promises);
    }

    public async fireLasersAsync() {
        // TODO: figure out how long lasers take instead of using a constant delay. If using moving projectiles, they should complete
        // when they hit the robot. If using instant-firing beams, they should complete when their animation finishes.
        for (let laser of this.lasers) {
            laser.fire();
        }

        await delay(500);   // give the players 500 ms to watch the lasers fire.
    }

    public async touchFlagsAsync() {
        for (let flag of this.flags)
            for (let robot of this.robots)
                if (robot.position.equals(flag.position))
                    flag.touchedBy(robot);
    }
}