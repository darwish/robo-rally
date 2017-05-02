/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>
/// <reference path="utility.ts"/>

var phaserGame: Phaser.Game, map: Phaser.Tilemap, wallLayer: Phaser.TilemapLayer, board: Board, laserProjectile: Phaser.Weapon;

enum GameState {
    Initializing,
    WaitingForPlayerInput,
    PlayingActions,
}

class Main {
    public gameState: GameState = GameState.Initializing;
    public globalCardDeck: CardDeck<ProgramCard>;
    public cards: ProgramCard[];
    public selectedCards: ProgramCard[] = [];
    public playerSubmittedCards: { [key: string]: ProgramCard[]; } = {};

    public preload() {
        phaserGame.load.baseURL = '/';
        //phaserGame.load.crossOrigin = 'anonymous';

        phaserGame.load.image('laser-emitter', 'images/Laser%20Small.png');
        phaserGame.load.image('laser-beam', 'images/Laser%20Segment.png');
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
        wallLayer = map.createLayer('Wall Layer');
        laserProjectile = phaserGame.add.weapon(-1, 'laser-projectile');
        laserProjectile.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        laserProjectile.bulletSpeed = 400;
        laserProjectile.bulletAngleOffset = 90;
        laserProjectile.fireRate = 0;

        board = new Board(map);
        initRoboRally();
    }

    public update() {

    }

    public render() {
        if (board) {
            for (let laser of board.lasers)
                laser.render();
        }
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

        this.startNewTurn();
    }

    private startNewTurn() {
        this.gameState = GameState.WaitingForPlayerInput;

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

            if (this.allPlayersSubmitted)
                this.runNextTurnAsync();
        });
    }

    public showCards(cards: ProgramCard[]) {
        $('.statusText').html('Choose Your Cards');

        $('.cardContainer').empty();
        cards.forEach((card) => {
            var cardChoice = $(`<li class="cardChoice" title="${card.toString()}">${card.toHtml()}<span class="phaseOrder"></span></li>`);
            cardChoice.data('card', card);
            $('.cardContainer').append(cardChoice);
        });

        $('.cardContainer').append(`<a href=# class="collapse" onclick="$('.cardContainer').toggleClass('collapsed')"></a>`);
    }

    public dealCards(handSizes: number[]) {
        // return all cards to the deck (by simply recreating the deck in its initial state)
        this.globalCardDeck = CardDeck.newProgramDeck();    
        return this.globalCardDeck.deal(handSizes);
    }

    public chooseCard(element) {
        var card = $(element).data('card');

        if ($(element).hasClass('selected')) {
            this.selectedCards.splice(this.selectedCards.indexOf(card), 1);
            $(element).removeClass('selected');
            $(element).find('.phaseOrder').text('');
            $('.submitCards').addClass('hidden');
        } else {
            if (this.selectedCards.length < 5) {
                this.selectedCards.push(card);
                $(element).addClass('selected');
                $(element).find('.phaseOrder').text(this.selectedCards.length);

                if (this.selectedCards.length == 5) {
                    $('.submitCards').removeClass('hidden');
                } else {
                    $('.submitCards').addClass('hidden');
                }
            }
        }

        // update phase order
        $('.cardContainer .cardChoice').each((i, el) => {
            let index = this.selectedCards.indexOf($(el).data('card'));
            return $(el).find('.phaseOrder').text(index < 0 ? '' : index + 1);
        });
        
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

        this.selectedCards = [];

        if (this.allPlayersSubmitted())
            this.runNextTurnAsync();
    }

    public allPlayersSubmitted() {
        return Object.keys(this.playerSubmittedCards).length == clientGame.getPlayers().length;
    }

    public async runNextTurnAsync() {
        this.gameState = GameState.PlayingActions;

        var turns = [];
        for (let clientId in this.playerSubmittedCards) {
            var robot = Board.Instance.robots.filter((r) => r.playerID == clientId)[0];
            turns.push(new RobotTurn(robot, this.playerSubmittedCards[clientId]));
        }

        this.startNewTurn();
        await TurnLogic.runAsync(turns);
    }
}

var main: Main;
function startGame() {
    main = new Main();
    phaserGame = new Phaser.Game(900, 900, Phaser.AUTO, $('#gameContainer')[0], { preload: () => main.preload(), create: () => main.create(), update: () => main.update(), render: main.render });;
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

