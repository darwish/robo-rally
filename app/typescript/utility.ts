declare var window: Window;
declare var QRCode: any;
declare var clientGame: ClientGame;
declare var socket: SocketIOClient.Socket;
const PiOver2 = Math.PI / 2;
import Point = Phaser.Point;

/** Promise version of setTimeout. Waits the specified number of milliseconds. Compatible with async/await. */
function delay(milliseconds: number) {
	return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

//////////// Extensions to Math ////////////

interface Math {
	/** Returns -1 if x < 0, 1 if x > 0 and 0 if x == 0 */
	sign(x: number): number
}

Math.sign = function (x: number) {
	return x == 0 ? 0 : x < 0 ? -1 : 1;
}


//////////// Extensions to String ////////////

interface String {
	capitalize(): string;
	toSentenceCase(): string;

	/** Adds a space before each capital letter other than the first character of the string. */
	addSpaces(): string;
	hash(): number;
}

String.prototype.capitalize = function () {
	return this.chatAt(0).toUpperCase() + this.substr(1);
}

String.prototype.toSentenceCase = function () {
	if (this.length == 0)
		return '';

	let result = '';
	let capitalizeNext = true;

	for (let i = 0; i < this.length; i++) {
		let c: string = this.charAt(i);
		if (c.match(/[.?!\r\n]/))
			capitalizeNext = true;

		if (capitalizeNext && c.match(/\w/)) {
			c = c.toUpperCase();
			capitalizeNext = false;
		}

		result += c;
	}

	return result;
}

String.prototype.addSpaces = function () {
	return this.split(/(?=[A-Z])/g).join(' ');
}

String.prototype.hash = function () {
	let hash = 0;
	for (let i = 0; i < this.length; i++)
		hash += this.charCodeAt(i) * (i + 1);

	return hash;
}
//////////// Extensions to Array ////////////

interface Array<T> {

	/** Creates and returns a new array without the excluded items. Does not modify the original array. Uses strict equality. */
	except(excludedItems: Array<T>): Array<T>;

	/** Removes the first occurance of an item from the array. Returns true if an item was removed and false it the item was not found. Uses strict equality. */
	remove(item: T): boolean;

	/** Removes the all occurances of an item from the array. Returns the number of items removed. Uses strict equality. */
	removeAll(item: T): number;

	/** Return true if the array contains the item.  Uses strict equality. */
	contains(item: T): boolean;
}

Array.prototype.contains = function(item) {
	return this.indexOf(item) >= 0;
}

// Not efficient for large arrays. Could use a hash table if required, but I doubt RoboRally will ever use this on large arrays (excludedItems.length > 100).
Array.prototype.except = function(excludedItems) {
	return this.filter(x => !excludedItems.contains(x));
}

Array.prototype.remove = function(item) {
	return this.splice(this.indexOf(item), 1).length > 0;
}

Array.prototype.removeAll = function(item) {
	let itemsRemoved = 0;
	for (var i = this.length - 1; i >= 0; i--) {
		if (this[i] === item) {
			this.splice(i, 1);
			itemsRemoved++;
		}
	}

	return itemsRemoved;
}