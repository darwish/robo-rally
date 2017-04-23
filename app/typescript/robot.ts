class Robot {

    public respawnPosition: BoardPosition;
    public isPoweredDown: boolean;
    public optionCards: OptionCard[];
    public lockedRegisters: boolean[];
    public availableProgramCards: ProgramCard[];
    public registeredProgramCards: ProgramCard[];
    public lastFlagOrder: number;

    readonly maxHealth = 10;

    constructor(public playerID: string, public position: BoardPosition, public orientation: Direction, public lives: number, public health?: number) {
        if (health == undefined) {
            this.health = this.maxHealth;
        }

        this.isPoweredDown = false;
        this.optionCards = [];
        this.lockedRegisters = [false,false,false,false,false];
        this.availableProgramCards = [];
        this.registeredProgramCards = [];
        this.lastFlagOrder = 0;
    }

    public rotate(quarterRotationsCW: number) {
        this.orientation = DirectionUtil.clamp(this.orientation + quarterRotationsCW);
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
        this.position.x = undefined;
        this.position.y = undefined;
    }
}
