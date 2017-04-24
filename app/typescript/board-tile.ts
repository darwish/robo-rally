class BoardTile {
    public position: BoardPosition;

    constructor(public map: Phaser.Tilemap, position: Point) {
        this.position = new BoardPosition(position.x, position.y);
    }

    private getPhaserTile(layerName: string) {
        return this.map.getTile(this.position.x, this.position.y, layerName);
    }

    public isPitTile() {
        let tile: Phaser.Tile = this.getPhaserTile("Floor Layer");
        switch (tile.index) {
            case 15:
            case 16:
            case 19:
            case 20:
                return true;
            default:
                return false;
        }
    }

    public isConveyorBelt() {
        let tile: Phaser.Tile = this.getPhaserTile("Floor Layer");
        if (tile.index <= 7) {   
            return true;
        }
        return false;
    }

    public isFastConveyorBelt() {
        let tile: Phaser.Tile = this.getPhaserTile("Floor Layer");
        if (tile.index >= 4 && tile.index <= 7) {   
            return true;
        }
        return false;
    }

    public isConveyorMerge() {
        let tile: Phaser.Tile = this.getPhaserTile("Floor Layer");

        switch (tile.index) {
            case 3:
            case 4:
            case 7:
            case 8:
                return true;
            default:
                return false;
        }
    }

    public getOtherConveyorEntrance(tile: BoardTile) {
        for (let position of this.getConveyorEntrances()) {
            if (tile.position.x != position.x || tile.position.y != position.y) {
                return new BoardTile(this.map, position);
            }
        }
    }

    protected getConveyorEntrances() {
        let entrances: BoardTile[];
        let tile = this.getPhaserTile("Floor Layer");

        switch (tile.index) {
            case 1:
            case 2:
            case 5:
            case 6:
                return [
                    this.position.getAdjacentPosition(Direction.W.rotate(tile.rotation))
                ];
            case 3:
            case 7:
                return [
                    this.position.getAdjacentPosition(Direction.W.rotate(tile.rotation)),
                    this.position.getAdjacentPosition(Direction.S.rotate(tile.rotation))
                ];
            case 4:
            case 8:
                return [
                    this.position.getAdjacentPosition(Direction.N.rotate(tile.rotation)),
                    this.position.getAdjacentPosition(Direction.S.rotate(tile.rotation))
                ];
        }
    }

    public hasObstacleInDirection(direction: Direction | Point | number) {
        direction = Direction.from(direction);

        var tile: Phaser.Tile = this.getPhaserTile("Wall Layer");
        if (tile == null) {
            return false;
        }

        if (tile.index == 13
            && (Direction.fromRadians(tile.rotation) == direction || Direction.fromRadians(tile.rotation - PiOver2) == direction)) {
            return true;
        }
        else if (tile.index == 14
            && Direction.fromRadians(tile.rotation) == direction) {
            return true;
        }
        else if ((tile.index == 17 || tile.index == 18)
            && Direction.fromRadians(tile.rotation + PiOver2) == direction) {
            return true;
        }

        return false;
    }

    public conveyorBeltRotationFromDirection(direction: Direction) {
        if (this.isConveyorBelt()) {
            let phaserTile: Phaser.Tile = this.getPhaserTile("Floor Layer");
            if (phaserTile.index == 2 || phaserTile.index == 6) {
                // rotates left from West
                if (Direction.W.rotate(phaserTile.rotation) == direction) {
                    return -1;
                }
            } else if (phaserTile.index == 3 || phaserTile.index == 7) {
                // rotates right from South
                if (Direction.S.rotate(phaserTile.rotation) == direction) {
                    return 1;
                }
            } else if (phaserTile.index == 4 || phaserTile.index == 8) {
                // rotates left from North
                if (Direction.N.rotate(phaserTile.rotation) == direction) {
                    return -1;
                }
                // rotates right from South
                if (Direction.S.rotate(phaserTile.rotation) == direction) {
                    return 1;
                }
            }
        }
        
        return 0;
    }

    public conveyorBeltMovementDirection() {
        if (this.isConveyorBelt()) {
            let phaserTile: Phaser.Tile = this.getPhaserTile("Floor Layer");
            switch (phaserTile.index) {
                case 1:
                case 3:
                case 4:
                case 5:
                case 7:
                case 8:
                    return Direction.E.rotate(phaserTile.rotation);
                case 2:
                case 6:
                    return Direction.N.rotate(phaserTile.rotation);
            }
        }
    }
}