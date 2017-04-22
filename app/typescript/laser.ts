class Laser {

    constructor(public position: BoardPosition, public facingDirection: Direction, public damagePower: number) {
    }

    public fire() {
        var robots = Board.Instance.robots;

        var closestFacingRobot = null;
        for (var i = 0; i < robots.length; i++) {

            if (this.facingDirection == Direction.E
                && robots[i].position.y == this.position.y
                && robots[i].position.x <= this.position.x) {

                closestFacingRobot = robots[i];
            }
        }

        closestFacingRobot.dealDamage(damagePower);
    }
}