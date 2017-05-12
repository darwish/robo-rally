class Player {
	constructor();
	constructor(id: string, friendlyName: string, robotSprite: number);
	constructor(public id?: string, public friendlyName?: string, public robotSprite?: number) { }
}

class ClientGame {
	public player: Player;
	private gameData: { gameId: string, host?: Player, players: Player[] };

	constructor(public gameId: string) {
		this.getOrCreateClientId();
		this.gameData = {
			gameId: gameId,
			host: null,
			players: []
		};
	}

	public setSelfAsHost() {
		this.gameData.host = this.player;
		this.saveGame();
	}

	public isHost() {
		return this.gameData.host && this.gameData.host.id == this.player.id;
	}

	public addPlayer(player: Player) {
		if (!this.gameData.players.some(x => x.id == player.id)) {
			this.gameData.players.push(player);
			this.saveGame();
			Board.Instance.onPlayerJoined(player);
		}
	}

	public getPlayers(): Player[] {
		return this.gameData.players;
	}

	public setPlayers(players: Player[]) {
		this.gameData.players = players;
		this.saveGame();
		Board.Instance.clearRobots();
		for (let player of players) {
			Board.Instance.onPlayerJoined(player);
		}
	}

	public saveGame() {
		localStorage['Game_' + this.gameId] = JSON.stringify(this.gameData);
	}

	public loadOrJoin() {
		if (!this.loadGame()) {
			this.joinGame();
		}
	}

	public loadGame() {
		if (!localStorage['Game_' + this.gameId]) {
			return false;
		}

		this.gameData = JSON.parse(localStorage['Game_' + this.gameId]);
		socket.emit('join', { gameId: this.gameId, player: this.player });
		// TODO: load state
		// Host loads from local storage, everyone else gets the broadcast when they join
		if (this.isHost()) {
			for (let player of this.gameData.players) {
				Board.Instance.onPlayerJoined(player);
			}
			socket.emit('broadcastPlayers', this.getPlayers());
		}

		return true;
	}

	public joinGame() {
		socket.emit('join', { gameId: this.gameId, player: this.player });
	}

	private getOrCreateClientId() {
		this.player = new Player();

		if ('clientId' in localStorage) {
			this.player.id = localStorage['clientId'];
			this.player.friendlyName = localStorage['friendlyName'];
			this.player.robotSprite = localStorage['robotSprite'];
		} else {
			this.player.id = localStorage['clientId'] = Guid.newGuid();
			this.player.friendlyName = localStorage['friendlyName'] = generateName();
			this.player.robotSprite = localStorage['robotSprite'] = Robot.pickRandomSprite();
		}
	}

	public getRobot(playerID = this.player) {
		return Board.Instance.robots.filter(x => x.playerID == playerID.id)[0];
	}
}