enum Direction {
    // increasing CW from North
    N = 0,
    E = 1,
    S = 2,
    W = 3
}

class DirectionUtil {
    public static getDirection(angleInDegrees) {
        return angleInDegrees / 90;
    }

    public static getOppositeDirection(direction: Direction) {
        return (direction + 2) % 4;
    }
}