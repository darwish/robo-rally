/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>

declare var window: Window;
declare var QRCode: any;
declare var clientGame: ClientGame;
declare var socket: SocketIOClient.Socket;

var phaserGame: Phaser.Game, map: Phaser.Tilemap, board: Board, laserProjectile:Phaser.Weapon;

class Main {
    public globalCardDeck: CardDeck;
    public cards: ProgramCard[];
    public selectedCards: ProgramCard[] = [];
    public playerSubmittedCards: { [key: string]: ProgramCard[]; } = {};

    constructor() {
        this.globalCardDeck = CardDeck.newDeck();
    }

    public preload() {
        phaserGame.load.baseURL = '/';
        //phaserGame.load.crossOrigin = 'anonymous';

        phaserGame.load.image('laser-emitter', 'images/Laser%20Small.png');
        phaserGame.load.image('tileset', 'images/Spritesheet%20Small.png');
        phaserGame.load.image('player-card', 'images/player-card.png');
        phaserGame.load.image('laser-projectile', 'images/laser-projectile.png');
        phaserGame.load.spritesheet('robots', 'images/robots.png', 75, 75);
        phaserGame.load.tilemap('tilemap', 'maps/Cross.json', null, Phaser.Tilemap.TILED_JSON);
    }

    public create() {
        map = phaserGame.add.tilemap('tilemap');
        map.addTilesetImage('RoboRallyOriginal', 'tileset');
        map.createLayer('Floor Layer').resizeWorld();
        map.createLayer('Wall Layer');
        laserProjectile = phaserGame.add.weapon(-1, 'laser-projectile');
        laserProjectile.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        laserProjectile.bulletSpeed = 400;

        board = new Board(map);
        initRoboRally();
    }

    public initGameObject() {
        phaserGame = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: this.preload, create: this.create, update: this.update });
    }

    public update() {
        for (let i = 0; i < board.robots.length; i++)
            board.robots[i].update();
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
        $('.playersList').empty();
        clientGame.getPlayers().forEach((player) => {
            var playerItem = $('<li class="playerItem">' + player.friendlyName + '</li>');
            playerItem.data('player', player);
            $('.playersList').append(playerItem);
        });
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
            handData[players[i].id] = hands[i];
        }
        socket.emit('dealtCards', handData);

        this.showCards(hands[0]);
        this.waitForAllSubmissions();
    }

    public quitGame() {
        window.location.href = "/";
    }

    public waitForCards() {
        socket.on('dealtCards', (handData) => {
            socket.off('dealtCards');

            var cardData = handData[clientGame.clientId.id];
            this.cards = cardData.map((c) => new ProgramCard(c.type, c.distance, c.priority));
            this.showCards(this.cards);

            this.waitForAllSubmissions();
        });
    }

    public waitForAllSubmissions() {
        socket.on('submitTurn', (submittedTurn) => {
            this.playerSubmittedCards[submittedTurn.playerId] = submittedTurn.cards.map((c) => new ProgramCard(c.type, c.distance, c.priority));

            $('.playersList .playerItem').filter(function () { return $(this).data('player').id == submittedTurn.playerId; }).addClass('submitted');

            this.checkForAllPlayerSubmissions();
        });
    }

    public showCards(cards: ProgramCard[]) {
        $('.statusText').html('Choose Your Cards');

        $('.cardContainer').empty();
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

        this.playerSubmittedCards[clientGame.clientId.id] = this.selectedCards;
        $('.playersList .playerItem').filter(function () { return $(this).data('player').id == clientGame.clientId.id; }).addClass('submitted');

        socket.emit('submitTurn', {
            playerId: clientGame.clientId.id,
            cards: this.selectedCards
        });
        this.checkForAllPlayerSubmissions();
    }

    public checkForAllPlayerSubmissions() {
        if (Object.keys(this.playerSubmittedCards).length == clientGame.getPlayers().length) {
            var turns = [];
            for (let clientId in this.playerSubmittedCards) {
                var robot = Board.Instance.robots.filter((r) => r.playerID == clientId)[0];
                turns.push(new RobotTurn(robot, this.playerSubmittedCards[clientId]));
            }
            var turnLogic = new TurnLogic();
            turnLogic.run(turns);
        }
    }
}

var main: Main;
function startGame() {
    main = new Main();
    main.initGameObject();
}

function initRoboRally() {
    var gameId = location.pathname.match(/^\/g\/(\w+)/)[1];

    clientGame = new ClientGame(gameId);
    socket = io();

    $('.code').text(gameId)
    $('.gameInfo').show();
    new QRCode($(".qrcode")[0], { text: "https://robo-rally.glitch.me/g/" + gameId, width: 66, height: 66 });

    if (!clientGame.isHost()) {
        clientGame.loadOrJoin();
    }
    if (clientGame.isHost()) {
        $('.startGame').removeClass('hidden').click(() => main.startGame());
        clientGame.addPlayer(clientGame.clientId);
    }
    main.waitForPlayers();

    $('.startGame').click(() => main.startGame());
    $('.quitGame').click(() => main.quitGame());
    $('.cardContainer').on('click', '.cardChoice', function () { main.chooseCard(this); });
    $('.submitCards').click(() => main.submitSelectedCards());
}

