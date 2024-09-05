import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../../genesis-state.json";
import { Tournament, CardGameState } from "./state";
import { tournamentTransitions, cardGameTransitions } from "./transitions";
import { TournamentState, GameStateLog } from './types';

const tournamentMachine = new StateMachine<TournamentState, TournamentState>({
  id: "cardGameTournament",
  stateClass: Tournament,
  initialState: genesisState.tournamentState,
  on: tournamentTransitions,
});

const gameMachine = new StateMachine({
  id: "cardGame",
  stateClass: CardGameState,
  initialState: {
    ...genesisState.state,
    score: [0, 0] as [number, number],
  } as GameStateLog,
  on: cardGameTransitions,
});

export { tournamentMachine, gameMachine };