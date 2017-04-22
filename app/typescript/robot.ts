class Robot {

    public isPoweredDown: boolean;
    public optionCards: OptionCard[];
    public lockedRegisters: number[];
    public availableProgramCards: ProgramCard[];
    public registeredProgramCards: ProgramCard[];

    readonly maxHealth = 9;

    constructor(public position: BoardPosition, public orientation: Direction, public lives: number, public health?: number) {
        if (health == undefined) {
            this.health = 9;
        }

        this.isPoweredDown = false;
        this.optionCards = [];
        this.lockedRegisters = [];
        this.availableProgramCards = [];
        this.registeredProgramCards = [];
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
    }

    public healDamage(healingAmount: number) {
        if (this.health + healingAmount >= this.maxHealth) {
            this.health = this.maxHealth;
        } else {
            this.health += 1;
        }
    }
}
