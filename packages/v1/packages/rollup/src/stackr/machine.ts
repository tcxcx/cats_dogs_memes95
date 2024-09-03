import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../../genesis-state.json";
import { CardGameState } from "./state";
import { transitions } from "./transitions";
import { GameStateLog } from "@v1/app/types";

const gameMachine = new StateMachine({
  id: "cardGame",
  stateClass: CardGameState,
  initialState: {
    ...genesisState.state,
    score: [0, 0] as [number, number],
  } as GameStateLog,
  on: transitions,
});

export { gameMachine };
