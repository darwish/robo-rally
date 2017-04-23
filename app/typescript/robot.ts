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

    constructor(private _position: BoardPosition, public orientation: Direction, public lives: number, spriteIndex: number = Robot.pickRandomSprite(), health = 10) {

        this.isPoweredDown = false;
        this.optionCards = [];
        this.lockedRegisters = [false,false,false,false,false];
        this.availableProgramCards = [];
        this.registeredProgramCards = [];
        this.lastFlagOrder = 0;

        let pixelPos = _position.toPixelPosition();
        this.sprite = phaserGame.add.sprite(pixelPos.x, pixelPos.y, 'robots');
        this.sprite.frame = spriteIndex;
        this.sprite.maxHealth = this.maxHealth;
        this.sprite.health = health;
    }

    public rotate(quarterRotationsCW: number) {
        this.orientation = DirectionUtil.clamp(this.orientation + quarterRotationsCW);
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
        return this._position;
    }

    set position(val: BoardPosition) {
        this._position = val.clone();
        this.sprite.position = val.toPixelPosition();
        this.sprite.visible = true;
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
