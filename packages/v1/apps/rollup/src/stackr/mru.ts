import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../../stackr.config";
import { gameMachine } from "./machine";
import {
  InitializeGameSchema,
  PlayTurnSchema,
  FinalizeGameSchema,
  StartTournamentSchema,
  RegisterPlayerSchema,
  StartMatchSchema,
  EndMatchSchema,
  RegisterDeckSchema,
} from "./schemas";

type GameMachineEngine = typeof gameMachine;

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [
    InitializeGameSchema,
    PlayTurnSchema,
    FinalizeGameSchema,
    StartTournamentSchema,
    RegisterPlayerSchema,
    StartMatchSchema,
    EndMatchSchema,
    RegisterDeckSchema
  ],

  
  stateMachines: [gameMachine],
});

await mru.init();


export { GameMachineEngine, mru };