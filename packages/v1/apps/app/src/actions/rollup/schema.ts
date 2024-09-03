import { z } from "zod";

export const initializeGameSchema = z.object({
  deckP1: z.array(z.string()),
  deckP2: z.array(z.string()),
});

export const playTurnSchema = z.object({
  handIndexP1: z.number(),
  powIndexP1: z.number(),
  handIndexP2: z.number(),
  powIndexP2: z.number(),
});

export const checkGameOverSchema = z.object({});

export const determineWinnerSchema = z.object({});

export type InitializeGameInput = z.infer<typeof initializeGameSchema>;
export type PlayTurnInput = z.infer<typeof playTurnSchema>;
export type CheckGameOverInput = z.infer<typeof checkGameOverSchema>;
export type DetermineWinnerInput = z.infer<typeof determineWinnerSchema>;
