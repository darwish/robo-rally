enum ProgramCardType {
    MOVE,
    ROTATE
}

class ProgramCard {
    constructor(public type: ProgramCardType, public distance: number, public priority: number) { }

    public toString() {
        return this.getName() + " (priority " + this.priority + ")";
    }

    public getName() {
        if (this.type == ProgramCardType.MOVE) {
            return "Move " + this.distance;
        } else {
            if (this.distance == 1) {
                return "Rotate Right";
            } else if (this.distance == -1) {
                return "Rotate Left";
            } else {
                return "U-Turn";
            }
        }
    }
}