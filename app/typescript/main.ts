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
        phaserGame.load.baseURL = '/';
        //phaserGame.load.crossOrigin = 'anonymous';

        phaserGame.load.image('laser', 'images/Laser%20Small.png');
        phaserGame.load.image('tileset', 'images/Spritesheet%20Small.png');
        phaserGame.load.image('player-card', 'images/player-card.png');
        phaserGame.load.spritesheet('robots', 'images/robots.png', 75, 75);
        phaserGame.load.tilemap('tilemap', 'maps/Cross.json', null, Phaser.Tilemap.TILED_JSON);
    }

    public create() {
        map = phaserGame.add.tilemap('tilemap');
        map.addTilesetImage('RoboRallyOriginal', 'tileset');
        map.createLayer('Floor Layer').resizeWorld();
        map.createLayer('Wall Layer');
    }

    public initGameObject() {
        phaserGame = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: this.preload, create: this.create });
    }

    public waitForPlayers() {
        this.initGameObject();

        this.showWaitingPlayers(clientGame);

        if (clientGame.isHost()) {
            socket.on('joined', (clientId) => {
                clientGame.addPlayer(clientId);

                if (clientGame.isHost()) {
                    socket.emit('broadcastPlayers', clientGame.getPlayers());
                }

                this.showWaitingPlayers(clientGame);
            });
        } else {
            this.waitForCards();

            socket.on('broadcastPlayers', (players) => {
                clientGame.setPlayers(players);
                this.showWaitingPlayers(clientGame);
            });
        }
    }

    public showWaitingPlayers(clientGame: ClientGame) {
        var list = clientGame.getPlayers().map((playerid) => {
            return '<li>' + playerid + '</li>';
        }).join('');
        $('.playersList').html(list);
    }

    public startGame() {
        socket.off('joined');
        socket.off('broadcastPlayers');

        var players = clientGame.getPlayers();
        var handSizes = players.map(() => 9);
        var hands = this.dealCards(handSizes);

        var handData = {};
        for (let i = 0; i < players.length; i++) {
            handData[players[i]] = hands[i];
        }
        socket.emit('dealtCards', JSON.stringify(handData));

        this.showCards(hands[0]);
    }

    public waitForCards() {
        socket.on('dealtCards', (handData) => {
            socket.off('dealtCards');

            var cardData = JSON.parse(handData)[clientGame.clientId];
            this.cards = cardData.map((c) => new ProgramCard(c.type, c.distance, c.priority));
            this.showCards(this.cards);
        });
    }

    public showCards(cards: ProgramCard[]) {
        $('.statusText').html('Choose Your Cards');

        var list = cards.map((card) => {
            return '<li>' + card.toString() + '</li>';
        }).join('');
        $('.cardContainer').html(list);
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

    $('.startGame').click(() => main.startGame());
}