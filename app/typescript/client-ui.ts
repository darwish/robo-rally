declare var $: any;
declare var socket: any;

class ClientUI {
    private state: ClientState = ClientState.GAME_PENDING;
    public globalCardDeck: CardDeck;
    public cards: ProgramCard[];

    constructor(public isHost: boolean) {
        this.globalCardDeck = CardDeck.newDeck();
    }

    public dealCards(handSizes: number[]) {
        return this.globalCardDeck.deal(handSizes);
    }

    public waitForStart() {
        socket.on('start', function(cards) {
            socket.off('start');
            $('.statusText').html('Starting...');
            $('.playersList').html('');

            this.waitForCards();
        });
    }

    public waitForCards() {
        socket.on('dealtCards', function(cards) {
            socket.off('dealtCards');
            this.cardHand = cards;
        });
    }
}

enum ClientState {
    GAME_PENDING,
    PROGRAMMING_REGISTERS,
    EXECUTING_REGISTERS,
    CLEAN_UP
}