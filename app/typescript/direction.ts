/**
 * Represents the four board directions, North, East, South and West. This class is immutable. Equality comparisons work
 * as expected because the same objects are always returned for a given direction. (For example, Direction.E == Direction.W.opposite() will return true.)
 */
class Direction {
    private constructor(private turns: number, private name: string) { }    // seeing "name" is handy in the chrome devtools

    public static readonly N = new Direction(0, "North");
    public static readonly E = new Direction(1, "East");
    public static readonly S = new Direction(2, "South");
    public static readonly W = new Direction(3, "West");
    public static readonly All = [Direction.N, Direction.E, Direction.S, Direction.W];

    public static fromTurns(turns: number) { return Direction.clamp(turns); }

    public static fromRadians(angleInRads: number) {
        return Direction.clamp(Math.round(angleInRads / PiOver2));
    }

    public static fromDegrees(angleInDeg: number) {
        return Direction.clamp(Math.round(angleInDeg / 90));
    }

    public static fromVector(v: Point) {
        return Direction.fromRadians(Math.atan2(v.y, v.x) + PiOver2);
    }

    /** "Overloaded" conversion. Converts a number in radians or a Point to a Direction. For convenience, you can also pass in a Direction,
     *  which will be returned unchanged. */
    public static from(val: number | Point | Direction) {
        return typeof val === 'number' ? Direction.fromRadians(val) : val instanceof Point ? Direction.fromVector(val) : val;
    }

    public toDegrees() {
        return this.turns * 90;
    }

    public toRadians() {
        return this.turns * PiOver2;
    }

    /** Returns a Phaser.Point for the unit vector for this direction. Positive x is east and positive y is south. */
    public toVector() {
        let sign = this.turns % 3 == 0 ? -1 : 1;
        return new Point((this.turns & 1) * sign, +!(this.turns & 1) * sign);
    }

    public opposite() {
        return this.addTurns(2);
    }

    public addTurns(turnsCW: number) {
        return Direction.clamp(turnsCW + this.turns);
    }

    /**
     * Rotates a by a given angle, snapped to the nearest 90° turn. Use addTurns() instead if you want to rotate by quarter revolutions.
     * @param angle Angle in radians, unless useDegrees is set to true.
     * @param useDegrees
     */
    public rotate(angle: number, useDegrees = false) {
        let deltaTurns = useDegrees ? angle / 90 : angle / PiOver2;
        return Direction.clamp(this.turns + deltaTurns);
    }

    private static clamp(direction: Direction | number) {
        let turns = direction instanceof Direction ? direction.turns : direction;

        if (turns < 0) {
            turns = (turns % 4) + 4;
        }

        return Direction.All[Math.floor(turns % 4)];
    }

    public toString() {
        return this.name;
    }
}