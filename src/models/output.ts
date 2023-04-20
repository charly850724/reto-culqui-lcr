export interface OuputParams {
    gameCounter: number;
    center: number;
    chipsPerPlayer: number[];
    haveWinner: boolean;
    playerIDWithoutTurn: number;
}

export interface UpdateChipsParams {
    diceRoll: string;
    chipsPerPlayer: number[];
    playerID: number,
    numberOfPlayers: number;
}
