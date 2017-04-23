class BoardTile {
    constructor(public map: Phaser.Tilemap, public position: BoardPosition) {}

    private getPhaserTile(layerName: string) {
        return this.map.getTile(this.position.x, this.position.y, layerName);
    }
    public isPitTile() {
        let tile: Phaser.Tile = this.getPhaserTile("Floor Layer");
        switch (tile.index) {
            case 14:
            case 15:
            case 18:
            case 19:
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
            case 2:
            case 3:
            case 6:
            case 7:
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
            case 0:
            case 1:
            case 4:
            case 5:
                return [
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.W, tile.rotation))
                ];
            case 2:
            case 6:
                return [
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.W, tile.rotation)),
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.S, tile.rotation))
                ];
            case 3:
            case 7:
                return [
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.N, tile.rotation)),
                    this.position.getAdjacentPosition(DirectionUtil.rotateDirection(Direction.S, tile.rotation))
                ];
        }
    }

    public hasObstacleInDirection(direction: Direction) {
        var tile: Phaser.Tile = this.getPhaserTile("Wall Layer");
        if (tile.index == 12
            && (DirectionUtil.getDirection(tile.rotation) == direction || DirectionUtil.getDirection(tile.rotation + 90) == direction)) {
            return true;
        }
        else if (tile.index == 13
            && DirectionUtil.getDirection(tile.rotation) == direction) {
            return true;
        }
        else if ((tile.index == 16 || tile.index == 17)
            && DirectionUtil.getDirection(tile.rotation + 90) == direction) {
            return true;
        }

        return false;
    }

    public conveyorBeltRotationFromDirection(direction: Direction) {
        if (this.isConveyorBelt()) {
            let phaserTile: Phaser.Tile = this.getPhaserTile("Floor Layer");
            if (phaserTile.index == 1 || phaserTile.index == 5) {
                // rotates left from West
                if (DirectionUtil.rotateDirection(Direction.W, phaserTile.rotation) == direction) {
                    return -1;
                }
            } else if (phaserTile.index == 2 || phaserTile.index == 6) {
                // rotates right from South
                if (DirectionUtil.rotateDirection(Direction.S, phaserTile.rotation) == direction) {
                    return 1;
                }
            } else if (phaserTile.index == 3 || phaserTile.index == 7) {
                // rotates left from North
                if (DirectionUtil.rotateDirection(Direction.N, phaserTile.rotation) == direction) {
                    return -1;
                }
                // rotates right from South
                if (DirectionUtil.rotateDirection(Direction.S, phaserTile.rotation) == direction) {
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
                case 0:
                case 2:
                case 3:
                case 4:
                case 6:
                case 7:
                    return DirectionUtil.rotateDirection(Direction.E, phaserTile.rotation);
                case 1:
                case 5:
                    return DirectionUtil.rotateDirection(Direction.N, phaserTile.rotation);
            }
        }
    }
}