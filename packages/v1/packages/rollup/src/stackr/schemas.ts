// packages/v1/packages/rollup/src/stackr/schemas.ts
import { ActionSchema, SolidityType } from "@stackr/sdk";

export const InitializeGameSchema = new ActionSchema("initialize-game", {
  deckP1: [SolidityType.STRING],
  deckP2: [SolidityType.STRING],
});

export const PlayTurnSchema = new ActionSchema("play-turn", {
  handIndexP1: SolidityType.UINT,
  powIndexP1: SolidityType.UINT,
  handIndexP2: SolidityType.UINT,
  powIndexP2: SolidityType.UINT,
});

export const FinalizeGameSchema = new ActionSchema("finalize-game", {
  playerScore: SolidityType.UINT,
  opponentScore: SolidityType.UINT,
  turnCount: SolidityType.UINT,
  gameLog: SolidityType.STRING,
});

export const schemas = {
  initializeGame: InitializeGameSchema,
  playTurn: PlayTurnSchema,
  finalizeGame: FinalizeGameSchema,
};
