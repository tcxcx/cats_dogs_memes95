import { STF, Transitions, Args, State } from "@stackr/sdk/machine";
import { CardGameState } from "./state";
import { finalizeGame } from "@v1/app/game-actions";
import {  GameStateLog, Deck, LogAction, MatchRequest, LogRequest, LeaderboardEntry, TournamentState, Player } from './types'

// === CARD GAME TRANSITIONS ===

const hasTournamentEnded = (state: TournamentState) => {
  return state.meta.season !== 0 && state.meta.endTime !== 0;
};

export const getLeaderboard = (state: TournamentState): LeaderboardEntry[] => {
  const { players, matches, meta } = state;
  const completedMatches = matches.filter((m: { endTime: any; }) => m.endTime);

  const leaderboard = players.map((player: any) => ({
    ...player,
    won: 0,
    lost: 0,
    points: 0
  }));

  if (meta.byes?.length) {
    meta.byes.forEach((bye: { playerId: any; }) => {
      const playerIndex = leaderboard.findIndex((l: { id: any; }) => l.id === bye.playerId);
      if (playerIndex !== -1) {
        leaderboard[playerIndex].points += 1;
      }
    });
  }

  completedMatches.forEach((match: { winnerId: any; scores: any; }) => {
    const { winnerId, scores } = match;
    const loserId = Object.keys(scores).find((k) => +k !== winnerId);
    if (!loserId) {
      return;
    }

    const winnerIndex = leaderboard.findIndex((l: { id: number; }) => l.id === +winnerId);
    const loserIndex = leaderboard.findIndex((l: { id: number; }) => l.id === +loserId);

    if (winnerIndex !== -1) {
      leaderboard[winnerIndex].won += 1;
      leaderboard[winnerIndex].points += 3;
    }
    if (loserIndex !== -1) {
      leaderboard[loserIndex].lost += 1;
    }
  });

  return leaderboard.sort((a: { points: number; won: number; }, b: { points: number; won: number; }) => {
    if (a.points === b.points) {
      return b.won - a.won;
    }
    return b.points - a.points;
  });
};

const getTopNPlayers = (state: TournamentState, n?: number) => {
  if (!n) {
    n = state.players.length;
  }

  const leaderboard = getLeaderboard(state);
  return leaderboard.slice(0, n);
};

// === TOURNAMENT TRANSITIONS ===
const startTournament: STF<State<TournamentState, TournamentState>> = {
  handler: ({ state, block }: Args<TournamentState>) => {
    if (hasTournamentEnded(state)) {
      throw new Error("TOURNAMENT_ALREADY_ENDED");
    }

    if (state.meta.startTime !== 0) {
      throw new Error("TOURNAMENT_ALREADY_STARTED");
    }

    return {
      ...state,
      meta: {
        ...state.meta,
        startTime: block.timestamp,
      },
    } as TournamentState;
  },
};

const registerPlayer: STF<State<TournamentState, TournamentState>, { playerId: number; playerName: string; deck: Deck }> = {
  handler: ({ state, inputs }: Args<TournamentState, { playerId: number; playerName: string; deck: Deck }>) => {
    const { playerId, playerName, deck } = inputs;
    if (state.players.find((p) => p.id === playerId)) {
      throw new Error("PLAYER_ALREADY_REGISTERED");
    }

    return {
      ...state,
      players: [...state.players, { id: playerId, name: playerName, deck }],
    } as TournamentState;
  },
};


const startMatch: STF<State<TournamentState, TournamentState>, MatchRequest> = {
  handler: ({ state, inputs, block }: Args<TournamentState, MatchRequest>) => {
    if (hasTournamentEnded(state)) {
      throw new Error("TOURNAMENT_ENDED");
    }
    const { matchId } = inputs;
    const match = state.matches.find((m) => m.id === matchId);
    if (!match) {
      throw new Error("MATCH_NOT_FOUND");
    }

    if (match.startTime) {
      throw new Error("MATCH_ALREADY_STARTED");
    }

    const updatedMatches = state.matches.map((m) => 
      m.id === matchId ? { ...m, startTime: block.timestamp } : m
    );

    return {
      ...state,
      matches: updatedMatches,
    } as TournamentState;
  },
};

// Ensure that `endMatch` is correctly defined like the other transitions above.
const endMatch: STF<State<TournamentState, TournamentState>, { matchId: number; winnerId: number }> = {
  handler: ({ state, inputs, block }: Args<TournamentState, { matchId: number; winnerId: number }>) => {
    const { matchId, winnerId } = inputs;
    const match = state.matches.find((m) => m.id === matchId);
    if (!match) {
      throw new Error("MATCH_NOT_FOUND");
    }
    if (match.endTime !== 0) {
      throw new Error("MATCH_ALREADY_ENDED");
    }

    const updatedMatches = state.matches.map((m) => 
      m.id === matchId ? { ...m, endTime: block.timestamp, winnerId } : m
    );

    return {
      ...state,
      matches: updatedMatches,
    } as TournamentState;
  },
};


const logWin: STF<State<TournamentState, TournamentState>, LogRequest> = {
  handler: ({ state, inputs, block }: Args<TournamentState, LogRequest>) => {
    const { matchId, playerId } = inputs;
    if (hasTournamentEnded(state)) {
      throw new Error("TOURNAMENT_ENDED");
    }

    const match = state.matches.find((m) => m.id === matchId);
    if (!match || !match.startTime || match.endTime) {
      throw new Error("INVALID_MATCH_STATE");
    }

    const updatedMatches = state.matches.map((m) => 
      m.id === matchId ? { ...m, scores: { ...m.scores, [playerId]: (m.scores[playerId] || 0) + 1 } } : m
    );

    return {
      ...state,
      matches: updatedMatches,
      logs: [
        ...state.logs,
        {
          playerId,
          matchId,
          timestamp: block.timestamp,
          action: LogAction.WIN,
        },
      ],
    } as TournamentState;
  },
};


const logLost: STF<State<TournamentState, TournamentState>, LogRequest> = {
  handler: ({ state, inputs, block }: Args<TournamentState, LogRequest>) => {
    const { matchId, playerId } = inputs;
    if (hasTournamentEnded(state)) {
      throw new Error("TOURNAMENT_ENDED");
    }

    const match = state.matches.find((m: { id: number; }) => m.id === matchId);
    if (!match || !match.startTime || match.endTime) {
      throw new Error("INVALID_MATCH_STATE");
    }

    return {
      ...state,
      logs: [
        ...state.logs,
        {
          playerId,
          matchId,
          timestamp: block.timestamp,
          action: LogAction.LOST,
        },
      ],
    } as TournamentState;
  },
};

// === === === === ===



// === CARD GAME TRANSITIONS ===

const initializeGameTransition: STF<CardGameState, { deckP1: string[]; deckP2: string[] }> = {
  handler: ({ state, inputs }) => {
    console.log("Read-only game initialization with decks:", {
      deckP1: inputs.deckP1,
      deckP2: inputs.deckP2,
    });

    return state;
  },
};

const playTurnTransition: STF<CardGameState, { 
  playerActiveCard: string; 
  opponentActiveCard: string; 
  selectedPower: string; 
  opponentSelectedPower: string;
}> = {
  handler: ({ state, inputs }) => {
    const { playerActiveCard, opponentActiveCard, selectedPower, opponentSelectedPower } = inputs;
    const [playerScore, opponentScore] = state.score;
    const newTurnCount = state.turnCount + 1;

    // Simple log for each turn
    console.log(`Turn ${newTurnCount}:`, {
      playerActiveCard,
      opponentActiveCard,
      selectedPower,
      opponentSelectedPower,
      newTurnCount,
      currentScore: {
        playerScore,
        opponentScore
      }
    });

    const newState = {
      ...state,
      turnCount: newTurnCount,
    };

    return newState;
  },
};


const finalizeGameTransition: STF<CardGameState, { playerScore: number; opponentScore: number; turnCount: number; gameLog: string }> = {
  handler: ({ state, inputs }) => {
    const { winner, updatedGameLog } = finalizeGame(
      inputs.playerScore,
      inputs.opponentScore,
      inputs.turnCount,
      JSON.parse(inputs.gameLog)
    );

    // Log the winner and the entire game log
    console.log("Game finalized.");
    console.log("Winner:", winner);
    console.log("Final Game Log:", updatedGameLog);

    // Return the updated state with the finalized game log and winner
    return {
      ...state,
      gameLog: updatedGameLog,
      winner,
    };
  },
};


// === === === === ===




// === EXPORT TRANSITIONS ===



export const tournamentTransitions: Transitions<State<TournamentState, TournamentState>> = {
  startTournament,
  registerPlayer,
  startMatch,
  endMatch,
  logWin,
  logLost,
};

export const cardGameTransitions: Transitions<State<GameStateLog, GameStateLog>> = {
  initializeGame: initializeGameTransition,
  playTurn: playTurnTransition,
  finalizeGame: finalizeGameTransition,
};

export const transitions = {
  ...tournamentTransitions,
  ...cardGameTransitions,
};