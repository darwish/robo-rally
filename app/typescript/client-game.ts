﻿class ClientGame {
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
        this.saveGame();
    }

    public isHost() {
        return this.gameData.hostId == this.clientId;
    }

    public addPlayer(playerId: string) {
        if (this.gameData.playerIds.indexOf(playerId) == -1) {
            this.gameData.playerIds.push(playerId);
            this.saveGame();
        }
    }

    public getPlayers(): string[] {
        return this.gameData.playerIds;
    }

    public setPlayers(players: string[]) {
        this.gameData.playerIds = players;
        this.saveGame();
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
        socket.emit('join', { gameId: this.gameId, clientId: this.clientId });
        // TODO: load state

        return true;
    }

    public joinGame() {
        socket.emit('join', { gameId: this.gameId, clientId: this.clientId });
    }

    private getOrCreateClientId() {
        if ('clientId' in localStorage) {
            this.clientId = localStorage['clientId'];
        } else {
            this.clientId = localStorage['clientId'] = Guid.newGuid();
        }
    }
}