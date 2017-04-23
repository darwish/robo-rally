class TurnLogic {
    private readonly PHASE_COUNT = 5;

    private phaseNumber: number;

    constructor(private turnsData: RobotTurn[]) {
        this.phaseNumber = 0;
    }

    public isDoneAllPhases() {
        return this.phaseNumber >= this.PHASE_COUNT;
    }

    public runNextTurnPhase() {
        var robotMovements = [];
        for (let turn of this.turnsData) {
            robotMovements.push(new RobotPhaseMovement(turn.robot, turn.programCards[this.phaseNumber]));
        }

        this.runRobotMovements(robotMovements);

        Board.Instance.executeBoardElements(this.phaseNumber);
        Board.Instance.fireLasers();
        Board.Instance.touchFlags();

        this.phaseNumber++;
    }

    private runRobotMovements(robotMovements: RobotPhaseMovement[]) {
        this.sortRobotMovements(robotMovements);

        for (let movement of robotMovements) {
            this.tryExecuteRobotMovement(movement);
        }
    }

    private tryExecuteRobotMovement(robotMovement: RobotPhaseMovement) {
        if (!robotMovement.robot.isDead()) {
            Board.Instance.runRobotProgram(robotMovement.robot, robotMovement.programCard);
        }
    }

    private sortRobotMovements(movements: RobotPhaseMovement[]) {
        movements.sort(function (a, b) {
            return b.programCard.priority - a.programCard.priority;
        });
    }
}