class Robot {

    public isPoweredDown: boolean;
    public optionCards: OptionCard[];
    public lockedRegisters: number[];

    constructor(public position: BoardPosition, public orientation: Direction, public lives: number, public health?: number) {
        if (health == undefined) {
            this.health = 9;
        }

        this.isPoweredDown = false;
        this.optionCards = [];
        this.lockedRegisters = []
    }

    public isDead() {
        return this.health == 0;
    }
}
