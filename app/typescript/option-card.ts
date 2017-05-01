class OptionCard {
    private static nextId = 0;
    readonly id: number;

    private constructor(public readonly name: string, public readonly description: string) {
        this.id = OptionCard.nextId++;
    }

    // TODO: create option cards
    static readonly RadioControl = new OptionCard('Radio Control', 'TODO...');

    static readonly All:OptionCard[] = Object.keys(OptionCard).map(x => OptionCard[x]).filter(x => x instanceof OptionCard);
}