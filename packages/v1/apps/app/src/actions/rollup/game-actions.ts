"use server";

import { nonAuthActionClient } from "@/actions/safe-action";
import {
  initializeGame,
  playTurn,
  checkGameOver,
  determineWinner,
} from "@/lib/actions/game.actions";
import { useWeb3Auth } from "@/lib/context/web3auth";
import {
  initializeGameSchema,
  playTurnSchema,
  checkGameOverSchema,
  determineWinnerSchema,
} from "./schema";

export const initializeGameAction = nonAuthActionClient
  .schema(initializeGameSchema)
  .metadata({
    name: "initialize-game",
  })
  .action(async ({ parsedInput: { deckP1, deckP2 } }) => {
    const { rpc, getAccounts } = useWeb3Auth();
    if (!rpc) throw new Error("RPC not initialized");

    const accounts = await getAccounts();
    if (accounts.length === 0) throw new Error("No accounts found");

    const address = accounts[0];

    return initializeGame(rpc, address, deckP1, deckP2);
  });

export const playTurnAction = nonAuthActionClient
  .schema(playTurnSchema)
  .metadata({
    name: "play-turn",
  })
  .action(
    async ({
      parsedInput: { handIndexP1, powIndexP1, handIndexP2, powIndexP2 },
    }) => {
      const { rpc, getAccounts } = useWeb3Auth();
      if (!rpc) throw new Error("RPC not initialized");

      const accounts = await getAccounts();
      if (accounts.length === 0) throw new Error("No accounts found");

      const address = accounts[0];

      return playTurn(
        rpc,
        address,
        handIndexP1,
        powIndexP1,
        handIndexP2,
        powIndexP2
      );
    }
  );

export const checkGameOverAction = nonAuthActionClient
  .schema(checkGameOverSchema)
  .metadata({
    name: "check-game-over",
  })
  .action(async () => {
    const { rpc, getAccounts } = useWeb3Auth();
    if (!rpc) throw new Error("RPC not initialized");

    const accounts = await getAccounts();
    if (accounts.length === 0) throw new Error("No accounts found");

    const address = accounts[0];

    return checkGameOver(rpc, address);
  });

export const determineWinnerAction = nonAuthActionClient
  .schema(determineWinnerSchema)
  .metadata({
    name: "determine-winner",
  })
  .action(async () => {
    const { rpc, getAccounts } = useWeb3Auth();
    if (!rpc) throw new Error("RPC not initialized");

    const accounts = await getAccounts();
    if (accounts.length === 0) throw new Error("No accounts found");

    const address = accounts[0];

    return determineWinner(rpc, address);
  });
