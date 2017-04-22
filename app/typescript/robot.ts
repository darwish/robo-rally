class Robot {

    public isPoweredDown: boolean;
    public optionCards: OptionCard[];
    public lockedRegisters: number[];
    public availableProgramCards: ProgramCard[];
    public registeredProgramCards: ProgramCard[];

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

    public turn(quarterRotationsCW: number) {
        this.orientation = (this.orientation + quarterRotationsCW) % 4;
        if (this.orientation < 0) {
            this.orientation += 4;
        }
    }
}
