class ClientGame {
    public clientId: string;
    private gameData: any;

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
        this.addPlayer(this.clientId);
    }

    public isHost() {
        return this.gameData.hostId == this.clientId;
    }

    public addPlayer(playerId: string) {
        this.gameData.playerIds.push(playerId);
    }

    public getPlayers(): string[] {
        return this.gameData.playerIds;
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
            return null;
        }

        this.gameData = JSON.parse(localStorage['Game_' + this.gameId]);
        socket.emit('join', { gameId: this.gameId, clientId: this.clientId });
        // TODO: load state

        return true;
    }

    public joinGame() {
    }

    private getOrCreateClientId() {
        if ('clientId' in localStorage) {
            this.clientId = localStorage['clientId'];
        } else {
            this.clientId = localStorage['clientId'] = Guid.newGuid();
        }
    }
}