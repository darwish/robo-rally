class ClientUI {
    private state: ClientState = ClientState.GAME_PENDING;
}

enum ClientState {
    GAME_PENDING,
    PROGRAMMING_REGISTERS,
    EXECUTING_REGISTERS,
    CLEAN_UP
}