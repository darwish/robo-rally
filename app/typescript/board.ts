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
            this.attemptMoveRobot(robot, direction);
            distance--;
        }
    }

    protected attemptMoveRobot(robot: Robot, direction: Direction) {

    }

    public getAdjacentBoardPosition(fromPosition: BoardPosition, direction: Direction) {
        switch direction {
            case Direction.N:
                return new BoardPosition(fromPosition.x, fromPosition.y + 1);
            case Direction.E:
                return new BoardPosition(fromPosition.x + 1, fromPosition.y);
            case Direction.S:
                return new BoardPosition(fromPosition.x, fromPosition.y - 1);
            case Direction.N:
                return new BoardPosition(fromPosition.x - 1, fromPosition.y);
        }
    }

    public hasObstacleInDirection(fromPosition: BoardPosition, direction: Direction) {
        // figure out if there are any permanent obstacles preventing progress in a certain direction
        return true;
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