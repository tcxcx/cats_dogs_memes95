import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../../genesis-state.json";
import { Tournament, CardGameState } from "./state";
import { tournamentTransitions, cardGameTransitions } from "./transitions";
import { TournamentState, GameStateLog } from './types';

const tournamentMachine = new StateMachine<TournamentState, TournamentState>({
  id: "cardGameTournament",
  stateClass: Tournament,
  initialState: {
    ...genesisState.tournamentState,
    admins: []
  } as TournamentState,
  on: tournamentTransitions,
});

const gameMachine = new StateMachine<GameStateLog, GameStateLog>({
  id: "cardGame",
  stateClass: CardGameState,
  initialState: {
    ...genesisState.state,
    score: [0, 0] as [number, number],
    winner: null,
  } as GameStateLog,
  on: cardGameTransitions,
});

export { tournamentMachine, gameMachine };