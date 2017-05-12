class Flag {

	public static highestOrder = 0;

	constructor(public position: BoardPosition, public order: number) {
	}

	public touchedBy(robot: Robot) {
		if (this.order == robot.lastFlagTouched + 1) {
			robot.lastFlagTouched = this.order;
		}

		if (robot.lastFlagTouched >= Flag.highestOrder) {
			// TODO: This robot wins; game over
		}
	}
}