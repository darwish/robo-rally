class Laser {
    private sprites: Phaser.Sprite[] = [];
    private beams: Phaser.Line[] = [];

    constructor(public position: BoardPosition, public facingDirection: Direction, public damagePower: number) {
        let pixelPos = position.toPixelPosition();
        let rot = DirectionUtil.toDegrees(facingDirection) - 90;
        pixelPos.x += 10;
        pixelPos.y += map.tileHeight / 2;
        let center = position.toCenterPixelPosition();
        pixelPos.rotate(center.x, center.y, rot, true);
        let graphics = phaserGame.add.graphics(0, 0);
        graphics.lineStyle(2, 0x660000);

        let offsets = [-25, 0, 25];
        for (let i = 0; i < damagePower; i++) {
            let p = new Phaser.Point(0, offsets[i]);
            p.rotate(0, 0, rot, true);
            p.add(pixelPos.x, pixelPos.y);

            let sprite = phaserGame.add.sprite(p.x, p.y, 'laser-emitter');
            sprite.anchor.set(0, 0.5);
            sprite.angle = rot;
            this.sprites.push(sprite);

            let end = Phaser.Point.rotate(p.clone(), p.x + 1000, p.y, rot, true);
            this.beams.push(new Phaser.Line(p.x, p.y, end.x, end.y));
        }
    }

    public render() {
        for (let beam of this.beams)
            phaserGame.debug.geom(beam);
    }

    public fire() {
        var robots = Board.Instance.robots;

        var closestFacingRobot:Robot = null;
        for (var i = 0; i < robots.length; i++) {

            if (this.facingDirection == Direction.E
                && robots[i].position.y == this.position.y
                && robots[i].position.x >= this.position.x
                && (closestFacingRobot == null || robots[i].position.x < closestFacingRobot.x)) {

                closestFacingRobot = robots[i];
            }
            else if (this.facingDirection == Direction.W
                && robots[i].position.y == this.position.y
                && robots[i].position.x <= this.position.x
                && (closestFacingRobot == null || robots[i].position.x > closestFacingRobot.x)) {

                closestFacingRobot = robots[i];
            }
            else if (this.facingDirection == Direction.N
                && robots[i].position.x == this.position.x
                && robots[i].position.y >= this.position.y
                && (closestFacingRobot == null || robots[i].position.y < closestFacingRobot.y)) {

                closestFacingRobot = robots[i];
            }
            else if (this.facingDirection == Direction.S
                && robots[i].position.x == this.position.x
                && robots[i].position.y <= this.position.y
                && (closestFacingRobot == null || robots[i].position.y > closestFacingRobot.y)) {

                closestFacingRobot = robots[i];
            }
        }

        if (closestFacingRobot) {
            closestFacingRobot.dealDamage(this.damagePower);
            laserProjectile.fire(this.position, closestFacingRobot.position.x, closestFacingRobot.position.y);
        }
    }
}