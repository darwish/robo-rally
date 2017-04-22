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

    public turn(robot: Robot, quarterRotationsCW: number) {
        robot.orientation = (robot.orientation + quarterRotationsCW) % 4;
        if (robot.orientation < 0) {
            robot.orientation += 4;
        }
    }
}