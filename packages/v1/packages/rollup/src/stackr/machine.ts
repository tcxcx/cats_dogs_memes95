import { StateMachine } from "@stackr/sdk/machine";
import * as genesisState from "../../genesis-state.json";
import { CardGameState } from "./state";
import { transitions } from "./transitions";

const gameMachine = new StateMachine({
  id: "cardGame",
  stateClass: CardGameState,
  initialState: genesisState.state,
  on: transitions,
});

export { gameMachine };