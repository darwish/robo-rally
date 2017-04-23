class Laser {

    constructor(public position: BoardPosition, public facingDirection: Direction, public damagePower: number) {
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