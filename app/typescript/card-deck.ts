class CardDeck {
    public static newDeck() {
        var cards = [];

        var priority = 10

        for (let i = 0; i < 6; i++) {
            cards.push(new ProgramCard(ProgramCardType.ROTATE, 2, priority));
            priority += 10;
        }

        for (let i = 0; i < 36; i++) {
            var direction = i % 2 == 0 ? -1 : 1;
            cards.push(new ProgramCard(ProgramCardType.ROTATE, direction, priority));
            priority += 10;
        }

        for (let i = 0; i < 6; i++) {
            cards.push(new ProgramCard(ProgramCardType.MOVE, -1, priority));
            priority += 10;
        }

        for (let i = 0; i < 18; i++) {
            cards.push(new ProgramCard(ProgramCardType.MOVE, 1, priority));
            priority += 10;
        }

        for (let i = 0; i < 12; i++) {
            cards.push(new ProgramCard(ProgramCardType.MOVE, 2, priority));
            priority += 10;
        }

        for (let i = 0; i < 6; i++) {
            cards.push(new ProgramCard(ProgramCardType.MOVE, 3, priority));
            priority += 10;
        }

        return new CardDeck(cards);
    }

    constructor(public cards: ProgramCard[]) { }

    public deal(handSizes: number[]) {
        this.shuffle();

        var hands: ProgramCard[][] = [];
        for (let size of handSizes) {
            hands.push(this.cards.splice(0, size));
        }

        return hands;
    }

    // From https://basarat.gitbooks.io/algorithms/content/docs/shuffling.html
    public shuffle() {
        for (let i = 0; i < this.cards.length; i++) {
            // choose a random not-yet-placed item to place there
            // must be an item AFTER the current item, because the stuff
            // before has all already been placed
            const randomChoiceIndex = this.getRandom(i, this.cards.length - 1);

            // place our random choice in the spot by swapping
            [this.cards[i], this.cards[randomChoiceIndex]] = [this.cards[randomChoiceIndex], this.cards[i]];
        }
    }

    private getRandom(low: number, high: number) {
        return low + Math.floor(Math.random() * (high - low + 1));
    }
}