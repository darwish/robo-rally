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

    public turn(robot: Robot, quarterRotationsCW: number) {
        robot.orientation = (robot.orientation + quarterRotationsCW) % 4;
        if (robot.orientation < 0) {
            robot.orientation += 4;
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