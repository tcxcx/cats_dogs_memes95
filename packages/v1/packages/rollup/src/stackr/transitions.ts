import { STF, Transitions } from "@stackr/sdk/machine";
import { CardGameState } from "./state";
import {
  calculateTurnOutcome,
  initializeGame as initGame,
  playTurn as playGameTurn,
  checkGameOver as isGameOver,
  determineWinner as getWinner,
} from "@v1/app/game-actions";

const initializeGame: STF<
  CardGameState,
  { deckP1: string[]; deckP2: string[] }
> = {
  handler: ({ state, inputs }) => {
    const initialState = initGame(inputs.deckP1, inputs.deckP2);
    return {
      ...state,
      ...initialState,
    };
  },
};

const playTurn: STF<
  CardGameState,
  {
    handIndexP1: number;
    powIndexP1: number;
    handIndexP2: number;
    powIndexP2: number;
  }
> = {
  handler: ({ state, inputs }) => {
    const { handIndexP1, powIndexP1, handIndexP2, powIndexP2 } = inputs;
    const { cardCollection, handP1, handP2, powerList, typeList } = state;

    const turnResult = calculateTurnOutcome(
      cardCollection,
      handP1[handIndexP1].name,
      handP2[handIndexP2].name,
      powerList[powIndexP1],
      powerList[powIndexP2],
      typeList,
      powerList
    );

    const newState = playGameTurn(
      state,
      handIndexP1,
      powIndexP1,
      handIndexP2,
      powIndexP2,
      typeList,
      powerList
    );

    // Ensure the score is updated based on the calculateTurnOutcome result
    newState.score[0] += turnResult.player1Points;
    newState.score[1] += turnResult.player2Points;

    return newState;
  },
};

const checkGameOver: STF<CardGameState, {}> = {
  handler: ({ state }) => {
    const gameOver = isGameOver(state);
    return { ...state, gameOver };
  },
};

const determineWinner: STF<CardGameState, {}> = {
  handler: ({ state }) => {
    const winner = getWinner(state);
    return { ...state, winner };
  },
};

export const transitions: Transitions<CardGameState> = {
  initializeGame,
  playTurn,
  checkGameOver,
  determineWinner,
};
