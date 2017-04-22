class TurnLogic {
    readonly numPhases = 5;

    run(turns: RobotTurn[]) {
        // Execute each phase, one at a time
        for (let i = 0; i < this.numPhases; i++) {
            // For each phase, we collect the action each robot will perform into an array of RobotPhaseAction objects.
            // We then execute the actions in priority order.
            var robotMovements = [];
            for (let turn of turns) {
                robotMovements.push(new RobotPhaseMovement(turn.robot, turn.programCards[i]));
            }

            this.runRobotMovements(robotMovements);

            Board.Instance.executeBoardElements();
            Board.Instance.fireLasers();
            Board.Instance.touchFlags();
        }
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