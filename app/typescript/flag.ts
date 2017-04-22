class Flag {

    public static highestOrder = 0;

    constructor(public position: BoardPosition, public order: number) {
    }

    public touchedBy(robot: Robot) {
        if (this.order = robot.lastFlagOrder + 1) {
            robot.lastFlagOrder = this.order;
        }

        if (robot.lastFlagOrder >= Flag.highestOrder) {
            // TODO: This robot wins; game over
        }
    }
}