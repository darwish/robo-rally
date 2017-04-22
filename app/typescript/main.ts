declare var $: any;
declare var io: any;
declare var QRCode: any;

declare var phaserGame: Phaser.Game;
declare var map: Phaser.Tilemap;
declare var clientGame: ClientGame;
declare var clientUI: ClientUI;

function preload() {
    phaserGame.load.baseURL = 'https://cdn.glitch.com/';
    phaserGame.load.crossOrigin = 'anonymous';

    phaserGame.load.image('laser', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FLaser%20Small.png?1491971767592');
    phaserGame.load.image('tileset', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FSpritesheet%20Small.png?1491966800433');
    phaserGame.load.tilemap('tilemap', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FCross.json?1491966835347', null, Phaser.Tilemap.TILED_JSON);
}

function create() {
    map = phaserGame.add.tilemap('tilemap');
    map.addTilesetImage('RoboRallyOriginal', 'tileset');
    map.createLayer('Tile Layer 1').resizeWorld();
    map.createLayer('Tile Layer 2');
}

function initGameObject() {
    phaserGame = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: preload, create: create });
}

function waitForPlayers() {
    initGameObject();

    if (clientGame.isHost()) {
        showWaitingPlayers(clientGame);
    } else {
        clientGame.loadOrJoin();
        showWaitingPlayers(clientGame);
    }

    socket.on('joined', function(clientId) {
        clientGame.addPlayer(clientId);
        showWaitingPlayers(clientGame);
    });
}

function showWaitingPlayers(clientGame: ClientGame) {
    var list = clientGame.getPlayers().map(function(playerid) {
        return '<li>' + playerid + '</li>';
    });
    $('.playersList').html(list);
}

function startGame() {
    clientUI = new ClientUI(clientGame.isHost());
    if (clientGame.isHost()) {
        var hands = clientUI.dealCards([9, 9, 9, 9, 9]);
        socket.emit('dealtCards', hands);
    } else {
        clientUI.waitForCards();
    }
}

function initRoboRally() {
    var gameId = location.pathname.match(/^\/g\/(\w+)/)[1];

    clientGame = new ClientGame(gameId);
    socket = io();

    $(window).load(function () {
        $('.code').text(gameId)
        $('.gameInfo').show();
        new QRCode($(".qrcode")[0], { text: "https://robo-rally.glitch.me/g/" + gameId, width: 66, height: 66 });
        // TODO save game

        clientGame.loadOrJoin();
        waitForPlayers();
    });

    $('.startGame').click(startGame);
}