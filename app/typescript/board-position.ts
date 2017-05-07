/// <reference path="main.ts"/>

class BoardPosition extends Point {

	public constructor(x: number, y: number);
	public constructor(p: Point);
	public constructor(x: number | Point = 0, y: number = 0) {
		if (typeof x === "number")
			super(x, y);
		else
			super(x.x, x.y);
	}

	public getAdjacentPosition(direction: Direction) {
		switch (direction) {
			case Direction.N:
				return new BoardPosition(this.x, this.y - 1);
			case Direction.E:
				return new BoardPosition(this.x + 1, this.y);
			case Direction.S:
				return new BoardPosition(this.x, this.y + 1);
			case Direction.W:
				return new BoardPosition(this.x - 1, this.y);
		}
	}

	/** Returns the center of the tile in pixel coordinates. */
	public toCenterPixelPosition() {
		return BoardPosition.toCenterPixelPosition(this);
	}

	/** Returns the center of the tile in pixel coordinates. */
	public static toCenterPixelPosition(p: Point): Point;
	public static toCenterPixelPosition(x: number, y: number): Point;
	public static toCenterPixelPosition(p: Point | number, y?: number) {
		let x: number;
		if (p instanceof Point) {
			x = p.x;
			y = p.y;
		}
		else
			x = p;

		let tile = map.getTile(x, y);
		return new Point(tile.centerX + tile.worldX, tile.centerY + tile.worldY);
	}

	/** Returns the top left of the tile in pixel coordinates. */
	public toPixelPosition() {
		return BoardPosition.toPixelPosition(this);
	}

	/** Returns the top left of the tile in pixel coordinates. */
	public static toPixelPosition(p: Point): Point;
	public static toPixelPosition(x: number, y: number): Point;
	public static toPixelPosition(p: Point | number, y?: number) {
		let x: number;
		if (p instanceof Point) {
			x = p.x;
			y = p.y;
		}
		else
			x = p;

		let tile = map.getTile(x, y);
		return new Point(tile.worldX, tile.worldY);
	}

	public clone() {
		return new BoardPosition(this.x, this.y);
	}
}