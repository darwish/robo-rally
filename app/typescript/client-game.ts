class PlayerID {
    constructor(public id: string, public friendlyName: string) { }
}

class ClientGame {
    public clientId: PlayerID;
    private gameData: { gameId: string, hostId?: PlayerID, playerIds: PlayerID[] };

    constructor(public gameId: string) {
        this.getOrCreateClientId();
        this.gameData = {
            gameId: gameId,
            hostId: null,
            playerIds: []
        };
    }

    public setSelfAsHost() {
        this.gameData.hostId = this.clientId;
        this.saveGame();
    }

    public isHost() {
        return this.gameData.hostId && this.gameData.hostId.id == this.clientId.id;
    }

    public addPlayer(playerId: PlayerID) {
        if (!this.gameData.playerIds.some(x => x.id == playerId.id)) {
            this.gameData.playerIds.push(playerId);
            this.saveGame();
            Board.Instance.onPlayerJoined(playerId);
        }
    }

    public getPlayers(): PlayerID[] {
        return this.gameData.playerIds;
    }

    public setPlayers(players: PlayerID[]) {
        this.gameData.playerIds = players;
        this.saveGame();
        Board.Instance.clearRobots();
        for (let playerId of players) {
            Board.Instance.onPlayerJoined(playerId);
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
        socket.emit('join', { gameId: this.gameId, clientId: this.clientId});
        // TODO: load state
        // Host loads from local storage, everyone else gets the broadcast when they join
        if (this.isHost()) {
            for (let playerId of this.gameData.playerIds) {
                Board.Instance.onPlayerJoined(playerId);
            }
            socket.emit('broadcastPlayers', this.getPlayers());
        }

        return true;
    }

    public joinGame() {
        socket.emit('join', { gameId: this.gameId, clientId: this.clientId });
    }

    private getOrCreateClientId() {
        this.clientId = new PlayerID(null, null);

        if ('clientId' in localStorage) {
            this.clientId.id = localStorage['clientId'];
            this.clientId.friendlyName  = localStorage['friendlyName'];
        } else {
            this.clientId.id  = localStorage['clientId'] = Guid.newGuid();
            this.clientId.friendlyName  = localStorage['friendlyName'] = generateName();
       }
    }

    public getRobot(playerID = this.clientId) {
        return Board.Instance.robots.filter(x => x.playerID == playerID.id)[0];
    }
}