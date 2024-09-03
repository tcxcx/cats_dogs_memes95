// packages/v1/packages/rollup/src/stackr/mru.ts
import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../../stackr.config";
import { gameMachine } from "./machine";
import { InitializeGameSchema, PlayTurnSchema, CheckGameOverSchema, DetermineWinnerSchema } from "./schemas";

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [InitializeGameSchema, PlayTurnSchema, CheckGameOverSchema, DetermineWinnerSchema],
  stateMachines: [gameMachine],
});

await mru.init();

export { mru };
