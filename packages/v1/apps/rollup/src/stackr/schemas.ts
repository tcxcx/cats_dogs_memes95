import { ActionSchema, SolidityType } from "@stackr/sdk";
import { register } from "module";

export const baseTimeStamp = {
  timestamp: SolidityType.UINT,
};

export const StartTournamentSchema = new ActionSchema("start-tournament", {
  ...baseTimeStamp,
});

export const RegisterPlayerSchema = new ActionSchema("register-player", {
  playerId: SolidityType.STRING,
  playerName: SolidityType.STRING,
  deck: SolidityType.STRING,
  walletAddress: SolidityType.STRING,
  ...baseTimeStamp,
});

export const RegisterDeckSchema = new ActionSchema("register-deck", {
  playerId: SolidityType.STRING,
  deck: SolidityType.STRING,
  walletAddress: SolidityType.STRING,
  ...baseTimeStamp,
});

export const StartMatchSchema = new ActionSchema("start-match", {
  matchId: SolidityType.STRING,
  player1Id: SolidityType.STRING,
  player2Id: SolidityType.STRING,
  ...baseTimeStamp,
});

export const EndMatchSchema = new ActionSchema("end-match", {
  matchId: SolidityType.STRING,
  winnerId: SolidityType.STRING,
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
// ========================================

export const schemas = {
  // ========================================
  // === SUPER IMPORTANT ===

  // PAY ATTENTION!!!
  // sometimes if the rollup doesnt work you must play around in schemas and transtions naming "wordword" or "word-word"
  // until it works, it sucks...
  // leave these as "wordword" with the fkcn "apostrophes on" do not change it with prettier or something or I'll be pissed
  // ========================================

  "starttournament": StartTournamentSchema,
  "registerplayer": RegisterPlayerSchema,
  "startmatch": StartMatchSchema,
  "endmatch": EndMatchSchema,
  "initializegame": InitializeGameSchema,
  "playturn": PlayTurnSchema,
  "finalizegame": FinalizeGameSchema,
  "registerdeck": RegisterDeckSchema,
};

