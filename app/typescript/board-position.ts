class BoardPosition extends Phaser.Point {

    public getAdjacentPosition(direction: Direction) {
        switch (direction) {
            case Direction.N:
                return new BoardPosition(this.x, this.y - 1);
            case Direction.E:
                return new BoardPosition(this.x + 1, this.y);
            case Direction.S:
                return new BoardPosition(this.x, this.y + 1);
            case Direction.W:
                return new BoardPosition(this.x - 1, this.y);
        }
    }

    /** Returns the center of the tile in pixel coordinates. */
    public toCenterPixelPosition() {
        let tile = map.getTile(this.x, this.y);
        return new Phaser.Point(tile.centerX + tile.worldX, tile.centerY + tile.worldY);
    }

    /** Returns the top left of the tile in pixel coordinates. */
    public toPixelPosition() {
        let tile = map.getTile(this.x, this.y);
        return new Phaser.Point(tile.worldX, tile.worldY);
    }

    public clone() {
        return new BoardPosition(this.x, this.y);
    }
}