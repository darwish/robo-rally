class BoardPosition {
    constructor(public x: number, public y: number) { }

    public getAdjacentPosition(direction: Direction) {
        switch (direction) {
            case Direction.N:
                return new BoardPosition(this.x, this.y + 1);
            case Direction.E:
                return new BoardPosition(this.x + 1, this.y);
            case Direction.S:
                return new BoardPosition(this.x, this.y - 1);
            case Direction.N:
                return new BoardPosition(this.x - 1, this.y);
        }
    }
}