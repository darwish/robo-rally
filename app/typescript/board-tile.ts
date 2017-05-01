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
            case Tiles.PitFourSides:
            case Tiles.PitThreeSides:
            case Tiles.PitLShaped:
            case Tiles.PitFourCorners:
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
            case Tiles.ConveyorSideMerge:
            case Tiles.ConveyorFrontMerge:
            case Tiles.FastConveyorSideMerge:
            case Tiles.FastConveyorFrontMerge:
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
            case Tiles.Conveyor:
            case Tiles.ConveyorTurn:
            case Tiles.FastConveyor:
            case Tiles.FastConveyorTurn:
                return [
                    this.position.getAdjacentPosition(Direction.W.rotate(tile.rotation))
                ];
            case Tiles.ConveyorSideMerge:
            case Tiles.FastConveyorSideMerge:
                return [
                    this.position.getAdjacentPosition(Direction.W.rotate(tile.rotation)),
                    this.position.getAdjacentPosition(Direction.S.rotate(tile.rotation))
                ];
            case Tiles.ConveyorFrontMerge:
            case Tiles.FastConveyorFrontMerge:
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

        if (tile.index == Tiles.WallCorner
            && (Direction.fromRadians(tile.rotation) == direction || Direction.fromRadians(tile.rotation - PiOver2) == direction)) {
            return true;
        }
        else if (tile.index == Tiles.Wall
            && Direction.fromRadians(tile.rotation) == direction) {
            return true;
        }
        else if ((tile.index == Tiles.Pusher135 || tile.index == Tiles.Pusher135)
            && Direction.fromRadians(tile.rotation - PiOver2) == direction) {
            return true;
        }

        return false;
    }

    public conveyorBeltRotationFromDirection(direction: Direction) {
        if (this.isConveyorBelt()) {
            let phaserTile: Phaser.Tile = this.getPhaserTile("Floor Layer");
            if (phaserTile.index == Tiles.ConveyorTurn || phaserTile.index == Tiles.FastConveyorTurn) {
                // rotates left from West
                if (Direction.W.rotate(phaserTile.rotation) == direction) {
                    return -1;
                }
            } else if (phaserTile.index == Tiles.ConveyorSideMerge || phaserTile.index == Tiles.FastConveyorSideMerge) {
                // rotates right from South
                if (Direction.S.rotate(phaserTile.rotation) == direction) {
                    return 1;
                }
            } else if (phaserTile.index == Tiles.ConveyorFrontMerge || phaserTile.index == Tiles.FastConveyorFrontMerge) {
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
                case Tiles.Conveyor:
                case Tiles.ConveyorSideMerge:
                case Tiles.ConveyorFrontMerge:
                case Tiles.FastConveyor:
                case Tiles.FastConveyorSideMerge:
                case Tiles.FastConveyorFrontMerge:
                    return Direction.E.rotate(phaserTile.rotation);
                case Tiles.ConveyorTurn:
                case Tiles.FastConveyorTurn:
                    return Direction.N.rotate(phaserTile.rotation);
            }
        }
    }
}

enum Tiles {
    None,
    Conveyor, ConveyorTurn, ConveyorSideMerge, ConveyorFrontMerge, 
    FastConveyor, FastConveyorTurn, FastConveyorSideMerge, FastConveyorFrontMerge,
    Floor, Option, Repair, Unused, 
    WallCorner, Wall, PitFourSides, PitThreeSides,
    Pusher135, Pusher24, PitLShaped, PitFourCorners,
    GearCCW, GearCW
}