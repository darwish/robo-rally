class Robot {

    public respawnPosition: BoardPosition;
    public isPoweredDown: boolean;
    public optionCards: OptionCard[];
    public lockedRegisters: boolean[];
    public availableProgramCards: ProgramCard[];
    public registeredProgramCards: ProgramCard[];
    public lastFlagOrder: number;
    public sprite: Phaser.Sprite;

    readonly maxHealth = 10;

    constructor(public playerID: string, private _position: BoardPosition, private _orientation: Direction, public lives: number, spriteIndex: number = Robot.pickRandomSprite(), health = 10) {

        this.isPoweredDown = false;
        this.optionCards = [];
        this.lockedRegisters = [false,false,false,false,false];
        this.availableProgramCards = [];
        this.registeredProgramCards = [];
        this.lastFlagOrder = 0;

        let pixelPos = _position.toCenterPixelPosition();
        this.sprite = phaserGame.add.sprite(pixelPos.x, pixelPos.y, 'robots');
        this.sprite.angle = this.orientation * 90;
        this.sprite.frame = spriteIndex;
        this.sprite.maxHealth = this.maxHealth;
        this.sprite.health = health;
        this.sprite.anchor.set(0.5);
    }

    public rotate(quarterRotationsCW: number) {
        this._orientation = DirectionUtil.clamp(this._orientation + quarterRotationsCW);

        let desiredAngle = DirectionUtil.toDegrees(this._orientation);

        let delta = Phaser.Math.wrapAngle(desiredAngle - this.sprite.angle)

        phaserGame.add.tween(this.sprite).to({ angle: this.sprite.angle + delta }, 750, Phaser.Easing.Cubic.InOut, true);
    }

    get orientation(): number {
        return this._orientation;
    }

    private static pickRandomSprite() {
        return Math.floor(Math.random() * phaserGame.cache.getFrameCount('robots'));
    }

    get health(): number {
        return this.sprite.health;
    }

    set health(val: number) {
        this.sprite.health = val;
    }

    get position(): BoardPosition {
        return this._position.clone();
    }

    set position(val: BoardPosition) {
        this._position = val.clone();
        let pixelPos = val.toCenterPixelPosition();
        phaserGame.add.tween(this.sprite).to({ x: pixelPos.x, y: pixelPos.y }, 750, Phaser.Easing.Cubic.InOut, true);
        this.sprite.visible = true;
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
        if (this.health - damageAmount <= 0) {
            this.health = 0;
        }
        else {
            this.health -= damageAmount;
        }

        this.updateLockedRegisters();
    }

    public healDamage(healingAmount: number) {
        if (this.health + healingAmount >= this.maxHealth) {
            this.health = this.maxHealth;
        } else {
            this.health += healingAmount;
        }

        this.updateLockedRegisters();
    }

    protected updateLockedRegisters() {
        this.lockedRegisters = [true,true,true,true,true];

        if (this.health > 1) {
            this.lockedRegisters[0] = false;
        }
        if (this.health > 2) {
            this.lockedRegisters[1] = false;
        }
        if (this.health > 3) {
            this.lockedRegisters[2] = false;
        }
        if (this.health > 4) {
            this.lockedRegisters[3] = false;
        }
        if (this.health > 5) {
            this.lockedRegisters[4] = false;
        }
    }

    public removeFromBoard() {
        this._position.x = undefined;
        this._position.y = undefined;
        this.sprite.visible = false;
    }
}
