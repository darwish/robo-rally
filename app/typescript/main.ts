/// <reference path="../../typings/phaser/phaser.comments.d.ts"/>
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/socket.io-client/socket.io-client.d.ts"/>
/// <reference path="utility.ts"/>

var phaserGame: Phaser.Game, map: Phaser.Tilemap, wallLayer: Phaser.TilemapLayer, board: Board, laserProjectile: Phaser.Weapon;
const DEBUG = true;

(function () {
	function preload() {
		phaserGame.load.baseURL = '/';
		//phaserGame.load.crossOrigin = 'anonymous';

		phaserGame.load.image('laser-emitter', 'images/Laser%20Small.png');
		phaserGame.load.image('laser-beam', 'images/Laser%20Segment.png');
		phaserGame.load.image('tileset', 'images/Spritesheet%20Small.png');
		phaserGame.load.image('player-card', 'images/player-card.png');
		phaserGame.load.image('laser-projectile', 'images/laser-projectile.png');
		phaserGame.load.spritesheet('robots', 'images/robots.png', 75, 75);
		phaserGame.load.tilemap('tilemap', 'maps/Cross.json', null, Phaser.Tilemap.TILED_JSON);

		for (let i = 1; i <= 5; i++)
			phaserGame.load.audio(`beepbeep${i}`, `sounds/beepbeep${i}.mp3`);
	}

	function create() {
		if (DEBUG) {
			phaserGame.stage.disableVisibilityChange = true;
			phaserGame.paused = false;
		}

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

	function render() {
		if (board) {
			for (let laser of board.lasers)
				laser.render();
		}
	}

	window['startGame'] = function() {
		phaserGame = new Phaser.Game(900, 900, Phaser.CANVAS, $('#gameContainer')[0], { preload: () => preload(), create: () => create(), render: render });;
	}
})();


function initRoboRally() {
	var game = new Game();
	var gameId = location.pathname.match(/^\/g\/(\w+)/)[1];

	clientGame = new ClientGame(gameId);
	socket = io();

	$('.gameInfo').removeClass('hidden');
	new QRCode($(".qrcode")[0], { text: '' + location, width: 66, height: 66 });

	if (!clientGame.isHost()) {
		clientGame.loadOrJoin();
	}

	if (clientGame.isHost()) {	// loadOrJoin() may have update our isHost() status
		$('.startGame').removeClass('hidden');
		clientGame.addPlayer(clientGame.player);
	}
	game.waitForPlayers();

	$('.startGame').click(() => game.startGame());
	$('.quitGame').click(() => game.quitGame());
	$('.cardContainer').on('click', '.cardChoice', function () { game.chooseCard(this); });
	$('.submitCards').click(() => game.submitSelectedCards());

	Chat.initialize('.chat');
}

