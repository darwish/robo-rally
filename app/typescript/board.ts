class Board {

    static Instance: Board

    public robots: Robot[];

    private lasers: Laser[];

    constructor(public map: Phaser.Tilemap)
    {
        if (Board.Instance != null) {
            throw new Error("Board singleton already exists!");
        }

        Board.Instance = this;

        this.loadBoard();
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

    private loadBoard() {
        // TODO: Actually load and store the lasers
    }

    public fireLasers() {
        for (let laser of this.lasers) {
            laser.fire();
        }
    }
}