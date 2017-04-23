enum TurnState {
    RobotMovement,
    BoardMovement,
    Lasers,
    Flags,
}

class TurnLogic {
    private readonly PHASE_COUNT = 5;

    private turnState: TurnState;
    private nextTurnPhaseStepTime: number;
    private phaseNumber: number;

    constructor(private turnsData: RobotTurn[]) {
        this.turnState = TurnState.RobotMovement;
        this.nextTurnPhaseStepTime = 0;
        this.phaseNumber = 0;
    }

    public isDoneAllPhases() {
        return this.phaseNumber >= this.PHASE_COUNT;
    }

    public update() {
        if (phaserGame.time.now >= this.nextTurnPhaseStepTime) {
            if (this.turnState == TurnState.RobotMovement) {
                this.runNextTurnPhase_RobotMovements();
                this.nextTurnPhaseStepTime = phaserGame.time.now + 1500;
                this.turnState = TurnState.BoardMovement;
            }
            else if (this.turnState == TurnState.BoardMovement) {
                Board.Instance.executeBoardElements(this.phaseNumber);
                this.nextTurnPhaseStepTime = phaserGame.time.now + 1500;
                this.turnState = TurnState.Lasers;
            }
            else if (this.turnState == TurnState.Lasers) {
                Board.Instance.fireLasers();
                this.nextTurnPhaseStepTime = phaserGame.time.now + 1500;
                this.turnState = TurnState.Flags;
            }
            else if (this.turnState == TurnState.Flags) {
                Board.Instance.touchFlags();
                this.nextTurnPhaseStepTime = phaserGame.time.now + 1500;
                this.turnState = TurnState.RobotMovement;
                this.phaseNumber++;
            }
        }
    }

    private runNextTurnPhase_RobotMovements() {
        var robotMovements = [];
        for (let turn of this.turnsData) {
            robotMovements.push(new RobotPhaseMovement(turn.robot, turn.programCards[this.phaseNumber]));
        }

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