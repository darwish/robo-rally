/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>

/* globals Phaser io */

declare var socket: SocketIOClient.Socket;


var game: Phaser.Game, map: Phaser.Tilemap;

function preload() {
    game.load.baseURL = 'https://cdn.glitch.com/';
    game.load.crossOrigin = 'anonymous';

    game.load.image('laser', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FLaser%20Small.png?1491971767592');
    game.load.image('tileset', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FSpritesheet%20Small.png?1491966800433');
    game.load.tilemap('tilemap', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FCross.json?1491966835347', null, Phaser.Tilemap.TILED_JSON);
}

function create() {
    map = game.add.tilemap('tilemap');
    map.addTilesetImage('RoboRallyOriginal', 'tileset');
    map.createLayer('Tile Layer 1').resizeWorld();
    map.createLayer('Tile Layer 2');
}

function startGame() {
    game = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: preload, create: create });
}

function loadGame(id) {
    if (!localStorage['Game_' + id])
        return null;

    var data = JSON.parse(localStorage['Game_' + id]);
    socket.emit('join', { id: id, name: data.name, isHost: data.isHost });
    // TODO: load state

    return data;
}

function saveGame() {
    var data: { [key: string]: string } = {};
    // TODO: get game state

    if (data["id"])
        localStorage['Game_' + data["id"]] = JSON.stringify(data);
}