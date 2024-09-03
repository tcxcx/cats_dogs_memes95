import { STF, Transitions } from "@stackr/sdk/machine";
import { CardGameState } from "./state";
import { initializeGame, playTurn, finalizeGame } from "@v1/app/game-actions";
import { GameStateLog } from "@v1/app/types";

const initializeGameTransition: STF<
  CardGameState,
  { deckP1: string[]; deckP2: string[] }
> = {
  handler: ({ state, inputs }) => {
    const initialState = initializeGame(inputs.deckP1, inputs.deckP2);
    return {
      ...state,
      ...initialState,
      gameLog: {
        initialDecks: {
          deckP1: inputs.deckP1,
          deckP2: inputs.deckP2,
        },
        turns: [],
        winner: null,
      },
    } as GameStateLog;
  },
};

const playTurnTransition: STF<
  CardGameState,
  {
    handIndexP1: number;
    powIndexP1: number;
    handIndexP2: number;
    powIndexP2: number;
  }
> = {
  handler: ({ state, inputs }) => {
    const newState = playTurn(
      state,
      inputs.handIndexP1,
      inputs.powIndexP1,
      inputs.handIndexP2,
      inputs.powIndexP2,
      state.typeList,
      state.powerList
    );

    // Update game log
    const updatedGameLog = {
      ...state.gameLog,
      turns: [
        ...state.gameLog.turns,
        {
          turnNumber: state.turnCount + 1,
          playedCards: {
            cardP1: state.handP1[inputs.handIndexP1],
            cardP2: state.handP2[inputs.handIndexP2],
            powerP1: state.powerList[inputs.powIndexP1],
            powerP2: state.powerList[inputs.powIndexP2],
          },
          currentScore: {
            player1Points: newState.score[0],
            player2Points: newState.score[1],
          },
        },
      ],
    };

    return {
      ...newState,
      gameLog: updatedGameLog,
    };
  },
};

const finalizeGameTransition: STF<
  CardGameState,
  {
    playerScore: number;
    opponentScore: number;
    turnCount: number;
    gameLog: string;
  }
> = {
  handler: ({ state, inputs }) => {
    const { winner, updatedGameLog } = finalizeGame(
      inputs.playerScore,
      inputs.opponentScore,
      inputs.turnCount,
      JSON.parse(inputs.gameLog)
    );

    return {
      ...state,
      gameLog: updatedGameLog,
      winner,
    };
  },
};

export const transitions: Transitions<CardGameState> = {
  initializeGame: initializeGameTransition,
  playTurn: playTurnTransition,
  finalizeGame: finalizeGameTransition,
};
