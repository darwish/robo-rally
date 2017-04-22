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

    public static clamp(direction: Direction) {
        while (direction < 0) {
            direction += 4;
        }

        return direction % 4;
    }

    public static opposite(direction: Direction) {
        return DirectionUtil.clamp(direction + 2);
    }
}