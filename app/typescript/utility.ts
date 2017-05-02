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