class Laser {
    private sprites: Phaser.Sprite[] = [];
    private beams: Phaser.Line[] = [];
    private direction: Point;

    constructor(public position: BoardPosition, facingDirection: Direction, public damagePower: number) {

        let pixelPos = position.toPixelPosition();
        let rot = facingDirection.toRadians() - PiOver2;
        this.direction = facingDirection.toVector();

        pixelPos.x += 10;
        pixelPos.y += map.tileHeight / 2;
        let center = position.toCenterPixelPosition();
        pixelPos.rotate(center.x, center.y, rot);
        let graphics = phaserGame.add.graphics(0, 0);
        graphics.lineStyle(2, 0x660000);

        let offsets = [-25, 0, 25];
        for (let i = 0; i < damagePower; i++) {
            let p = new Point(0, offsets[i]);
            p.rotate(0, 0, rot);
            p.add(pixelPos.x, pixelPos.y);

            let sprite = phaserGame.add.sprite(p.x, p.y, 'laser-emitter');
            sprite.anchor.set(0, 0.5);
            sprite.rotation = rot;
            this.sprites.push(sprite);

            let start = Point.multiply(this.direction, new Point(14, 14)).add(p.x, p.y);
            let length = this.findBeamLength(position, this.direction);
            let end = new Point(length * this.direction.x + start.x, length * this.direction.y + start.y);

            this.beams.push(new Phaser.Line(start.x, start.y, end.x, end.y));
        }
    }

    private findBeamLength(startTile: Point, direction: Point) {
        let current = startTile.clone();
        let exitDir = Direction.fromVector(direction);
        let enterDir = exitDir.opposite();
        let board = Board.Instance;
        let robots = board.robots;
        let length = -14;    // Since beams travel in one direction, it's easier to use a scalar.

        while (board.isPositionOnBoard(current)) {
            length += map.tileWidth / 2;

            if (board.robotInPosition(current)) 
                break;

            length += map.tileWidth / 2 - 10;
            if (board.hasObstacleInDirection(current, exitDir))
                break;

            Point.add(current, direction, current);
            length += 10;
        }

        return length;
    }

    public render() {
        for (let beam of this.beams)
            phaserGame.debug.geom(beam, 'rgba(255,0,0,0.3)');
    }

    public fire() {
        var robots = Board.Instance.robots;
        let target: Robot = null;
        let dir = Direction.fromVector(this.direction);

        let current = this.position.clone();
        while (board.isPositionOnBoard(current)) {
            if (target = board.robotInPosition(current))
                break;
            else if (board.hasObstacleInDirection(current, dir))
                break;

            Point.add(current, this.direction, current);
        }

        if (target) {
            target.dealDamage(this.damagePower);
            let targetPos = target.sprite.position;
            for (let beam of this.beams)
                laserProjectile.fire(beam.start, targetPos.x, targetPos.y);
        }
    }
}