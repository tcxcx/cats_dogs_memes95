import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../../stackr.config";
import { gameMachine } from "./machine";
import {
  InitializeGameSchema,
  PlayTurnSchema,
  FinalizeGameSchema,
} from "./schemas";

export const initializeMRU = async () => {
  const mru = await MicroRollup({
    config: stackrConfig,
    actionSchemas: [InitializeGameSchema, PlayTurnSchema, FinalizeGameSchema],
    stateMachines: [gameMachine],
  });

  await mru.init();
  return mru;
};
