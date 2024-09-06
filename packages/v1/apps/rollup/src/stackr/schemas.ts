import { ActionSchema, SolidityType } from "@stackr/sdk";

export const baseTimeStamp = {
  timestamp: SolidityType.UINT,
};

export const StartTournamentSchema = new ActionSchema("start-tournament", {
  ...baseTimeStamp,
});

export const RegisterPlayerSchema = new ActionSchema("register-player", {
  playerId: SolidityType.UINT,
  playerName: SolidityType.STRING,
  deck: SolidityType.STRING,
  ...baseTimeStamp,
});

export const StartMatchSchema = new ActionSchema("start-match", {
  matchId: SolidityType.UINT,
  player1Id: SolidityType.UINT,
  player2Id: SolidityType.UINT,
  ...baseTimeStamp,
});

export const EndMatchSchema = new ActionSchema("end-match", {
  matchId: SolidityType.UINT,
  winnerId: SolidityType.UINT,
  ...baseTimeStamp,
});

export const InitializeGameSchema = new ActionSchema("initialize-game", {
  deckP1: SolidityType.STRING,
  deckP2: SolidityType.STRING,
});

export const PlayTurnSchema = new ActionSchema("play-turn", {
  playerActiveCard: SolidityType.STRING,
  opponentActiveCard: SolidityType.STRING,
  selectedPower: SolidityType.STRING,
  opponentSelectedPower: SolidityType.STRING,
});

export const FinalizeGameSchema = new ActionSchema("finalize-game", {
  playerScore: SolidityType.UINT,
  opponentScore: SolidityType.UINT,
  turnCount: SolidityType.UINT,
  gameLog: SolidityType.STRING,
});

export const schemas = {
  "starttournament": StartTournamentSchema,
  "registerplayer": RegisterPlayerSchema,
  "startmatch": StartMatchSchema,
  "endmatch": EndMatchSchema,
  "initializegame": InitializeGameSchema,
  "playturn": PlayTurnSchema,
  "finalizegame": FinalizeGameSchema,
};