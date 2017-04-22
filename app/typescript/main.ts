/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>


declare var QRCode: any;
declare var clientGame: ClientGame;
declare var socket: SocketIOClient.Socket;

var phaserGame: Phaser.Game, map: Phaser.Tilemap;

class Main {
    public globalCardDeck: CardDeck;
    public cards: ProgramCard[];

    constructor() {
        this.globalCardDeck = CardDeck.newDeck();
    }

    public preload() {
        phaserGame.load.baseURL = 'https://cdn.glitch.com/';
        phaserGame.load.crossOrigin = 'anonymous';

        phaserGame.load.image('laser', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FLaser%20Small.png?1491971767592');
        phaserGame.load.image('tileset', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FSpritesheet%20Small.png?1491966800433');
        phaserGame.load.tilemap('tilemap', '389dcdd1-6e4d-4bcb-aedc-9d688fb06c3f%2FCross.json?1491966835347', null, Phaser.Tilemap.TILED_JSON);
    }

    public create() {
        map = phaserGame.add.tilemap('tilemap');
        map.addTilesetImage('RoboRallyOriginal', 'tileset');
        map.createLayer('Tile Layer 1').resizeWorld();
        map.createLayer('Tile Layer 2');

        new Board(map);
    }

    public initGameObject() {
        phaserGame = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: this.preload, create: this.create });
    }

    public waitForPlayers() {
        this.initGameObject();

        this.showWaitingPlayers(clientGame);

        var self = this;

        if (clientGame.isHost()) {
            socket.on('joined', function (clientId) {
                clientGame.addPlayer(clientId);

                if (clientGame.isHost()) {
                    socket.emit('broadcastPlayers', clientGame.getPlayers());
                }

                self.showWaitingPlayers(clientGame);
            });
        } else {
            socket.on('broadcastPlayers', function (players) {
                clientGame.setPlayers(players);
                self.showWaitingPlayers(clientGame);
            });
        }
    }

    public showWaitingPlayers(clientGame: ClientGame) {
        var list = clientGame.getPlayers().map(function (playerid) {
            return '<li>' + playerid + '</li>';
        }).join('');
        $('.playersList').html(list);
    }

    public waitForStart() {
        socket.on('start', function (cards) {
            socket.off('start');
            $('.statusText').html('Starting...');
            $('.playersList').html('');

            this.waitForCards();
        });
    }

    public startGame() {
        if (clientGame.isHost()) {
            var hands = this.dealCards([9, 9, 9, 9, 9]);
            socket.emit('dealtCards', hands);
        } else {
            this.waitForCards();
        }
    }

    public waitForCards() {
        socket.on('dealtCards', function (cards) {
            socket.off('dealtCards');
            this.cardHand = cards;
        });
    }

    public dealCards(handSizes: number[]) {
        return this.globalCardDeck.deal(handSizes);
    }
}

function initRoboRally() {
    var gameId = location.pathname.match(/^\/g\/(\w+)/)[1];

    var main = new Main();
    clientGame = new ClientGame(gameId);
    socket = io();

    $(window).load(function () {
        $('.code').text(gameId)
        $('.gameInfo').show();
        new QRCode($(".qrcode")[0], { text: "https://robo-rally.glitch.me/g/" + gameId, width: 66, height: 66 });

        if (!clientGame.isHost()) {
            clientGame.loadOrJoin();
        }
        main.waitForPlayers();
    });

    $('.startGame').click(main.startGame);
}