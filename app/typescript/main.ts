/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>

declare var window: Window;
declare var QRCode: any;
declare var clientGame: ClientGame;
declare var socket: SocketIOClient.Socket;

var phaserGame: Phaser.Game, map: Phaser.Tilemap;

class Main {
    public globalCardDeck: CardDeck;
    public cards: ProgramCard[];
    public selectedCards: ProgramCard[] = [];
    public playerSubmittedCards: { [key: string]: ProgramCard[]; } = {};

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
        $('.startGame').addClass("hidden");
        $('.quitGame').removeClass("hidden");

        socket.off('joined');
        socket.off('broadcastPlayers');

        var players = clientGame.getPlayers();
        var handSizes = players.map(() => 9);
        var hands = this.dealCards(handSizes);

        var handData = {};
        for (let i = 0; i < players.length; i++) {
            handData[players[i]] = hands[i];
        }
        socket.emit('dealtCards', handData);

        this.showCards(hands[0]);
    }

    public quitGame() {
        window.location.href = "/";
    }

    public waitForCards() {
        socket.on('dealtCards', (handData) => {
            socket.off('dealtCards');

            var cardData = handData[clientGame.clientId];
            this.cards = cardData.map((c) => new ProgramCard(c.type, c.distance, c.priority));
            this.showCards(this.cards);

            this.waitForAllSubmissions();
        });
    }

    public waitForAllSubmissions() {
        socket.on('submitTurn', (submittedTurn) => {
            this.playerSubmittedCards[submittedTurn.playerId] = submittedTurn.cards.map((c) => new ProgramCard(c.type, c.distance, c.priority));
            this.checkForAllPlayerSubmissions();
        });
    }

    public showCards(cards: ProgramCard[]) {
        $('.statusText').html('Choose Your Cards');

        $('.cardContainer').empty();
        cards.forEach
        cards.forEach((card) => {
            var cardChoice = $('<li class="cardChoice">' + card.toString() + '</li>');
            cardChoice.data('card', card);
            $('.cardContainer').append(cardChoice);
        });
    }

    public dealCards(handSizes: number[]) {
        return this.globalCardDeck.deal(handSizes);
    }

    public chooseCard(element) {
        var card = $(element).data('card');

        if ($(element).hasClass('selected')) {
            this.selectedCards.splice(this.selectedCards.indexOf(card), 1);
            $(element).removeClass('selected');
            $('.submitCards').addClass('hidden');
        } else {
            if (this.selectedCards.length < 5) {
                this.selectedCards.push(card);
                $(element).addClass('selected');

                if (this.selectedCards.length == 5) {
                    $('.submitCards').removeClass('hidden');
                } else {
                    $('.submitCards').addClass('hidden');
                }
            }
        }
    }

    public submitSelectedCards() {
        if (this.selectedCards.length != 5) {
            alert("You must choose 5 cards to submit. You've only chosen " + this.selectedCards.length + ".");
            return;
        }

        this.playerSubmittedCards[clientGame.clientId] = this.selectedCards;
        this.checkForAllPlayerSubmissions();

        socket.emit('submitTurn', {
            playerId: clientGame.clientId,
            cards: this.selectedCards
        });
    }

    public checkForAllPlayerSubmissions() {
        if (Object.keys(this.playerSubmittedCards).length == clientGame.getPlayers().length) {
            var turns = [];
            for (let clientId in this.playerSubmittedCards) {
                //Board.Instance.robots.filter((r) => r)
                turns.push(new RobotTurn(this.robot, this.playerSubmittedCards[clientId]));
            }
            var turnLogic = new TurnLogic();
            turnLogic.run(turns);
        }
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

        main.initGameObject();

        if (!clientGame.isHost()) {
            clientGame.loadOrJoin();
        }
        main.waitForPlayers();
    });

    $('.startGame').click(() => main.startGame());
    $('.quitGame').click(() => main.quitGame());
    $('.cardContainer').on('click', '.cardChoice', function () { main.chooseCard(this); });
    $('.submitCards').click(() => main.submitSelectedCards());
}