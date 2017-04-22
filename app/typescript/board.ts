class Board {

    static Instance: Board

    public robots: Robot[];

    private lasers: Laser[];
    private flags: Flag[];

    constructor(public map: Phaser.Tilemap)
    {
        if (Board.Instance != null) {
            throw new Error("Board singleton already exists!");
        }

        Board.Instance = this;

        this.loadBoard();
    }

    private loadBoard() {

        this.map.objects.forEach(object => {
            if (object.type == "Laser") {
                var newLaser = new Laser(new BoardPosition(object.x, object.y), DirectionUtil.getDirection(object.rotation), object.count);
                this.lasers.push(newLaser);
            }
            else if (object.type == "Flag") {
                var newFlag = new Flag(new BoardPosition(object.x, object.y), object.order);
                this.flags.push(newFlag);

                if (newFlag.order > Flag.highestOrder) {
                    Flag.highestOrder = newFlag.order;
                }
            }
        });
    }

    

    public addRobot(newRobot: Robot) {
        this.robots.push(newRobot);
    }

    protected turnRobot(robot: Robot, quarterRotationsCW: number) {
        robot.orientation = (robot.orientation + quarterRotationsCW) % 4;
        if (robot.orientation < 0) {
            robot.orientation += 4;
        }
    }

    protected moveRobot(robot: Robot, distance: number, direction: Direction) {
        if (distance < 0) {
            throw new Error("Cannot move negatice distance!");
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

    public getTileType(position: BoardPosition) {
        return '';
    }

    public isPositionOnBoard(position: BoardPosition) {
        if (position.x < this.map.width &&
            position.x >= 0 &&
            position.y < this.map.height &&
            position.y >= 0
        ) {
            return true;
        }
        return false;
    }

    protected attemptMoveRobot(robot: Robot, direction: Direction) {
        if (this.hasObstacleInDirection(robot.position, direction)) {
            throw new Error("Cannot move robot! Obstacle in the way.");
        }

        let newPosition = robot.position.getAdjacentPosition(direction);
        if (!this.isPositionOnBoard(newPosition) || this.getTileType(newPosition) == "Pit") {
            robot.removeFromBoard();
            return;
        }

        for (let otherRobot of this.robots) {
            if (otherRobot.position.x == newPosition.x && otherRobot.position.y == newPosition.y) {
                try {
                    this.attemptMoveRobot(otherRobot, direction);
                    robot.position = newPosition;
                } catch (e) {
                    // continue processing moves
                }
            }
        }
    }

    public hasObstacleInDirection(tilePosition: BoardPosition, direction: Direction) {

        if (this.hasObstacleInDirectionInternal(tilePosition, direction)) {
            return true;
        }
        else if (this.isPositionOnBoard(tilePosition.getAdjacentPosition(direction))
            && this.hasObstacleInDirectionInternal(tilePosition.getAdjacentPosition(direction), DirectionUtil.opposite(direction))) {
            return true;
        }

        return false;
    }

    private hasObstacleInDirectionInternal(tilePosition: BoardPosition, direction: Direction) {
        var tile: Phaser.Tile = this.map.getTile(tilePosition.x, tilePosition.y, "Wall Layer");
        if (tile.index == 12
            && (DirectionUtil.getDirection(tile.rotation) == direction || DirectionUtil.getDirection(tile.rotation + 90) == direction)) {
            return true;
        }
        else if (tile.index == 13
            && DirectionUtil.getDirection(tile.rotation) == direction) {
            return true;
        }

        return false;
    }

    public runRobotProgram(robot: Robot, programAction: ProgramCard) {
        switch (programAction.type) {
            case ProgramCardType.ROTATE:
                this.turnRobot(robot, programAction.distance);
                break;
            case ProgramCardType.MOVE:
                let orientation = robot.orientation;
                if (programAction.distance < 0) {
                    orientation = (robot.orientation + 4) % 4;
                }
                this.moveRobot(robot, Math.abs(programAction.distance), orientation);
                break;
        }
    }

    public executeBoardElements() {
        // TODO:
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