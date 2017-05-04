declare var window: Window;
declare var QRCode: any;
declare var clientGame: ClientGame;
declare var socket: SocketIOClient.Socket;
const PiOver2 = Math.PI / 2;
import Point = Phaser.Point;

interface Math {
    /** Returns -1 if x < 0, 1 if x > 0 and 0 if x == 0 */
    sign(x: number): number
}

Math.sign = function (x: number) {
    return x == 0 ? 0 : x < 0 ? -1 : 1;
}

/** Promise version of setTimeout. Waits the specified number of milliseconds. Compatible with async/await. */
function delay(milliseconds: number) {
    return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

interface String {
    toSentenceCase(): string;
    hash(): number;
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

String.prototype.hash = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++)
        hash += this.charCodeAt(i) * (i + 1);

    return hash;
}