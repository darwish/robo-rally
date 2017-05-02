class TurnLogic {
    private static readonly PHASE_COUNT = 5;

    public static async runAsync(turnsData: RobotTurn[]) {
        for (let i = 0; i < TurnLogic.PHASE_COUNT; i++) {
            await TurnLogic.runRobotMovementAsync(turnsData, i);
            await Board.Instance.executeBoardElementsAsync(i);
            await Board.Instance.fireLasersAsync();
            await Board.Instance.touchFlagsAsync();
        }
    }

    private static async runRobotMovementAsync(turnsData: RobotTurn[], phaseNumber: number) {
        let movements = turnsData.filter(x => !x.robot.isDead())
            .map(x => ({ robot: x.robot, programCard: x.programCards[phaseNumber] }))
            .sort((a, b) => b.programCard.priority - a.programCard.priority);

        for (let movement of movements)
            await Board.Instance.runRobotProgram(movement.robot, movement.programCard);
    }
}