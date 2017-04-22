class TurnLogic {
    readonly numPhases = 5;

    constructor(public board: Board) { }

    run(turns: RobotTurn[]) {
        // Execute each phase, one at a time
        for (let i = 0; i < this.numPhases; i++) {
            // For each phase, we collect the action each robot will perform into an array of RobotPhaseAction objects.
            // We then execute the actions in priority order.
            var actions = [];
            for (let turn of turns) {
                actions.push(new RobotPhaseAction(turn.robot, turn.programCards[i]));
            }

            this.runActions(actions);

            this.board.executeBoardElements();
            this.board.fireLasers();
            this.board.touchFlags();
        }
    }

    private runActions(actions: RobotPhaseAction[]) {
        this.sortActions(actions);

        for (let action of actions) {
            this.executeAction(action);
        }
    }

    private executeAction(robotPhase: RobotPhaseAction) {
        this.board
    }

    private sortActions(actions: RobotPhaseAction[]) {
        actions.sort(function (a, b) {
            return b.programCard.priority - a.programCard.priority;
        });
    }
}