class OptionCard {
	private static nextId = 0;
	readonly id: number;

    /** Returns true when we need to prompt the owner on whether they'd like to use this option card. Returns false if this card is automatically used
      * or if the player cannot currently use this card. */
	public readonly canChoose = (owner: Robot) => false;

	/** Returns true when this card should activate. */
	public readonly mustUse = (owner: Robot) => false;

	/** Performs the action of this card. You may optionally return a new ProgramCard to replace the robot's current movement. */
	public readonly activate: (owner: Robot, ...otherData) => ProgramCard;

	// I didn't use the shorthand for creating the function properties in the constructor so that I could put doc comments.

	protected constructor(public readonly name: string, public readonly description: string,
		_canChoose = (owner: Robot) => false, _mustUse = (owner: Robot) => false, _activate = (owner: Robot) => { }) {
		this.id = OptionCard.nextId++;
		this.canChoose = _canChoose || this.canChoose;
		this.mustUse = _mustUse || this.mustUse;
	}

	// helper for option cards that activate when you shoot someone.
	private static hasTarget(owner: Robot) {
		return owner.getTarget() != null;
	}

	static readonly RadioControl = new OptionCard('Radio Control', 'TODO...', OptionCard.hasTarget, null, owner => {
		let target = owner.getTarget();
		Board.Instance.changeRobotProgram(target, owner.registeredProgramCards.map(x => new ProgramCard(x.type, x.distance, x.priority - 1)));
	});

	// TODO: create other option cards

	static readonly All = Object.keys(OptionCard).map(x => OptionCard[x]).filter(x => x instanceof OptionCard);
}
