enum Direction {
    // increasing CW from North
    N = 0,
    E = 1,
    S = 2,
    W = 3
}

class DirectionUtil {
    public static getDirection(angleInDegrees) {
        while (angleInDegrees < 0) {
            angleInDegrees += 360;
        }

        return angleInDegrees / 90 % 360;
    }

    public static opposite(direction: Direction) {
        return (direction + 2) % 4;
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

    public static rotateDirection(direction: Direction, angleInDegrees: number) {
        return this.getDirection(this.toDegrees(direction) + angleInDegrees);
    }
}