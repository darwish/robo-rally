class Board {
	private static readonly PHASE_COUNT = 5;
	static Instance: Board

	public robots: Robot[] = [];

	public lasers: Laser[] = [];
	public flags: Flag[] = [];

	private turnsData: RobotTurn[];

	private _phase: number;
	public get phase() { return this._phase; }

	constructor(public map: Phaser.Tilemap) {
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

	public onPlayerJoined(player: Player) {
		var newRobot = new Robot(player.id, new BoardPosition(this.robots.length, 0), Direction.S, 3, player.robotSprite); // TODO: can't start all robots at the same place
		this.robots.push(newRobot);
	}

	public clearRobots() {
		this.robots = [];
	}

	// For Radio Control and other option cards.
	public changeRobotProgram(robot: Robot, newProgram: ProgramCard[]) {
		let turn = this.turnsData.filter(x => x.robot == robot)[0];
		turn.programCards = newProgram;
	}

	public async runTurnAsync(turnsData: RobotTurn[]) {
		this.turnsData = turnsData; // turn data can be altered by some options cards

		for (this._phase = 0; this._phase < Board.PHASE_COUNT; this._phase++) {
			await this.runRobotMovementAsync(turnsData, this._phase);
			await this.executeBoardElementsAsync(this._phase);
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

		let movements: Promise<void>[] = [];
		while (distance !== 0) {
			distance -= Math.sign(distance);
			try {
				movements.push(this.moveRobotOneTile(robot, direction));
			} catch (e) {
				// continue attempting to move, so we can animate each attempt
			}
		}

		// apply all movements before awaiting, so that it performs a move 3 in one smooth movement instead of 3 individual steps
		await Promise.all(movements);	
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

		let usedOptions = robot.optionCards.filter(x => x.mustUse(robot));
		if (robot.optionCards.some(x => x.canChoose(robot))) {
			// TODO: allow user to choose option cards to use. Eligible cards should be highlighted, and the player
			// should be given some time to click on them. More than one option card may be used.
		}

		for (let card of usedOptions)
			programAction = card.activate(robot) || programAction;

		switch (programAction.type) {
			case ProgramCardType.ROTATE:
				await robot.rotateAsync(programAction.distance);
				break;
			case ProgramCardType.MOVE:
				await this.moveRobot(robot, programAction.distance, robot.direction);
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
		if (!tile || tile.isPitTile()) {
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

	/** Returns the robot the passed attacker can shoot, or null if it doesn't have line-of-sight to any robot. */
	public getTarget(attacker: { position: BoardPosition, direction: Direction }) {
		let target: Robot = null;
		let dir = attacker.direction;

		let current = attacker.position.clone();
		while (this.isPositionOnBoard(current)) {
			if (target = this.robotInPosition(current))
				break;
			else if (this.hasObstacleInDirection(current, dir))
				break;

			Point.add(current, attacker.direction.toVector(), current);
		}

		return target;
	}
}