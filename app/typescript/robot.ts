class Robot {
	public static readonly NumSprites = 6;		// Can use phaserGame.cache.getFrameCount('robots') after images have been loaded. Unfortunately, we need this value before then.

	public respawnPosition: BoardPosition;
	public isPoweredDown: boolean;
	public optionCards: OptionCard[];
	public lockedRegisters: boolean[];
	public availableProgramCards: ProgramCard[];
	public registeredProgramCards: ProgramCard[];
	public lastFlagTouched: number;
	public sprite: Phaser.Sprite;

	readonly maxHealth = 10;

	constructor(public playerID: string, private _position: BoardPosition, private _direction: Direction, public lives: number, spriteIndex: number = Robot.pickRandomSprite(), health?: number) {

		this.isPoweredDown = false;
		this.optionCards = [];
		this.lockedRegisters = [false, false, false, false, false];
		this.availableProgramCards = [];
		this.registeredProgramCards = [];
		this.lastFlagTouched = 0;

		let pixelPos = _position.toCenterPixelPosition();
		this.sprite = phaserGame.add.sprite(pixelPos.x, pixelPos.y, 'robots');
		this.sprite.angle = _direction.toDegrees() + 180;
		this.sprite.frame = Math.floor(Math.abs(spriteIndex)) % phaserGame.cache.getFrameCount('robots');	// Convert invalid indexes to the proper range
		this.sprite.maxHealth = this.maxHealth;
		this.sprite.health = health || this.maxHealth;
		this.sprite.anchor.set(0.5);
	}

	public rotateAsync(quarterRotationsCW: number) {
		this._direction = this._direction.addTurns(quarterRotationsCW);

		let desiredAngle = this._direction.toDegrees() + 180;
		let delta = Phaser.Math.wrapAngle(desiredAngle - this.sprite.angle)

		return new Promise<void>(resolve =>
			phaserGame.add.tween(this.sprite)
				.to({ angle: this.sprite.angle + delta }, 750, Phaser.Easing.Cubic.InOut, true)
				.onComplete.add(resolve));
	}

	public moveAsync(val: BoardPosition) {
		this._position = val.clone();
		let pixelPos = val.toCenterPixelPosition();
		this.sprite.visible = true;

		return new Promise<void>(resolve => phaserGame.add.tween(this.sprite).to({ x: pixelPos.x, y: pixelPos.y }, 750, Phaser.Easing.Cubic.InOut, true).onComplete.add(resolve));
	}

	get direction() {
		return this._direction;
	}

	public static pickRandomSprite() {
		return Math.floor(Math.random() * Robot.NumSprites);
	}

	get health() {
		return this.sprite.health;
	}

	set health(val: number) {
		this.sprite.health = val;
	}

	get position(): BoardPosition {
		return this._position.clone();
	}

	get x(): number {
		return this._position.x;
	}

	get y(): number {
		return this._position.y;
	}

	public isDead() {
		return this.health <= 0;
	}

	public dealDamage(damageAmount: number) {
		this.health = Math.max(this.health - damageAmount, 0);
		this.updateLockedRegisters();
	}

	public healDamage(healingAmount: number) {
		this.health = Math.min(this.health + healingAmount, this.maxHealth);
		this.updateLockedRegisters();
	}

	protected updateLockedRegisters() {
		for (let i = 0; i < this.lockedRegisters.length; i++)
			this.lockedRegisters[i] = this.health <= i + 1;
	}

	public removeFromBoard() {
		this._position.x = undefined;
		this._position.y = undefined;
		this.sprite.visible = false;
	}

	/** Returns the robot we can shoot if any, or null. */
	public getTarget() {
		return Board.Instance.getTarget(this);
	}

	public serialize() {
		let properties = $.extend({}, this);
		properties.sprite = this.sprite.frame;
		properties.health = this.sprite.health;
		
		return JSON.stringify(properties);
	}

	public static deserialize(serialized: string) {
		let obj = JSON.parse(serialized);

		let robot = new Robot(obj.playerID, obj._position, obj._direction, obj.lives, obj.sprite, obj.health);
		robot.respawnPosition = obj.respawnPosition;
		robot.isPoweredDown = obj.isPoweredDown;
		robot.optionCards = obj.optionCards;
		robot.lockedRegisters = obj.lockedRegisters;
		robot.availableProgramCards = obj.availableProgramCards;
		robot.registeredProgramCards = obj.registeredProgramCards;
		robot.lastFlagTouched = obj.lastFlagTouched;

		return robot;
	}
}
