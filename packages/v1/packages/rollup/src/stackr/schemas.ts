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

export const CheckGameOverSchema = new ActionSchema("check-gameover", {});

export const DetermineWinnerSchema = new ActionSchema("determine-winner", {});