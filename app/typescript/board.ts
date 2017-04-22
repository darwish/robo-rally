class Board {

    static Instance: Board

    public robots: Robot[];

    constructor()
    {
        if (Board.Instance != null) {
            throw new Error("Board singleton already exists!");
        }

        Board.Instance = this;
    }

    public addRobot(newRobot: Robot) {
        this.robots.push(newRobot);
    }
}