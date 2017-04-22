class Board {

    static Instance: Board

    public robots: Robot[];

    constructor(public map: Phaser.Tilemap)
    {
        if (Board.Instance != null) {
            throw new Error("Board singleton already exists!");
        }

        Board.Instance = this;
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
}