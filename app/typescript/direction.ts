enum Direction {
    // increasing CW from North
    N = 0,
    E = 1,
    S = 2,
    W = 3
}

class DirectionUtil {
    public static getDirection(angleInRads) {
        let angleInDegrees = Phaser.Math.radToDeg(angleInRads);
        while (angleInDegrees < 0) {
            angleInDegrees += 360;
        }

        return ((angleInDegrees % 360) / 90) % 4;
    }

    public static clamp(direction: Direction) {
        while (direction < 0) {
            direction += 4;
        }

        return direction % 4;
    }

    public static opposite(direction: Direction) {
        return DirectionUtil.clamp(direction + 2);
    }

    public static toDegrees(direction: Direction) {
        switch (direction) {
            case Direction.N:
                return 0;
            case Direction.E:
                return 90;
            case Direction.S:
                return 180;
            case Direction.W:
                return 270;
        }
    }

    public static rotateDirection(direction: Direction, angleInRads: number) {
        return this.getDirection(Phaser.Math.degToRad(this.toDegrees(direction)) + angleInRads);
    }
}