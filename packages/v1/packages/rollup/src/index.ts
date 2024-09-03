// /home/tcxcx/coding_projects/cats_dogs_memes95/packages/v1/packages/rollup/src/index.ts

import { ActionConfirmationStatus } from "@stackr/sdk";
import { mru } from "./stackr/mru";
import {
  InitializeGameSchema,
  PlayTurnSchema,
  CheckGameOverSchema,
  DetermineWinnerSchema,
} from "./stackr/schemas";
import { signMessage } from "./utils";
import { CardData } from "@v1/app/types";
import { userCards } from "@v1/app/mock-cards";
import { useWeb3Auth, EthereumRpc } from "@v1/app/web3auth";

const main = async () => {
  const { rpc, getAccounts } = useWeb3Auth();

  if (!rpc) {
    console.error("RPC not initialized");
    return;
  }

  const accounts = await getAccounts();
  if (accounts.length === 0) {
    console.error("No accounts found");
    return;
  }

  const address = accounts[0];

  // Initialize the game
  const deckP1: string[] = (userCards as CardData[])
    .slice(0, 10)
    .map((card) => card.name);
  const deckP2: string[] = (userCards as CardData[])
    .slice(10, 20)
    .map((card) => card.name);

  const initializeInputs = {
    deckP1,
    deckP2,
    timestamp: Date.now(),
  };

  const initializeSignature = await signMessage(
    rpc as EthereumRpc,
    InitializeGameSchema,
    initializeInputs
  );
  const initializeAction = InitializeGameSchema.actionFrom({
    inputs: initializeInputs,
    signature: initializeSignature,
    msgSender: address,
  });

  let ack = await mru.submitAction("initializeGame", initializeAction);
  console.log("Initialize Game Action Hash:", ack.hash);

  let { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);
  console.log("Initialize Game Result:", { logs, errors });

  // Play a turn
  const playTurnInputs = {
    handIndexP1: 0,
    powIndexP1: 0,
    handIndexP2: 0,
    powIndexP2: 0,
    timestamp: Date.now(),
  };

  const playTurnSignature = await signMessage(
    rpc as EthereumRpc,
    PlayTurnSchema,
    playTurnInputs
  );
  const playTurnAction = PlayTurnSchema.actionFrom({
    inputs: playTurnInputs,
    signature: playTurnSignature,
    msgSender: address,
  });

  ack = await mru.submitAction("playTurn", playTurnAction);
  console.log("Play Turn Action Hash:", ack.hash);

  ({ logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1));
  console.log("Play Turn Result:", { logs, errors });

  // Check if game is over
  const checkGameOverInputs = { timestamp: Date.now() };
  const checkGameOverSignature = await signMessage(
    rpc as EthereumRpc,
    CheckGameOverSchema,
    checkGameOverInputs
  );
  const checkGameOverAction = CheckGameOverSchema.actionFrom({
    inputs: checkGameOverInputs,
    signature: checkGameOverSignature,
    msgSender: address,
  });

  ack = await mru.submitAction("checkGameOver", checkGameOverAction);
  console.log("Check Game Over Action Hash:", ack.hash);

  ({ logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1));
  console.log("Check Game Over Result:", { logs, errors });

  // Determine winner
  const determineWinnerInputs = { timestamp: Date.now() };
  const determineWinnerSignature = await signMessage(
    rpc as EthereumRpc,
    DetermineWinnerSchema,
    determineWinnerInputs
  );
  const determineWinnerAction = DetermineWinnerSchema.actionFrom({
    inputs: determineWinnerInputs,
    signature: determineWinnerSignature,
    msgSender: address,
  });

  ack = await mru.submitAction("determineWinner", determineWinnerAction);
  console.log("Determine Winner Action Hash:", ack.hash);

  ({ logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1));
  console.log("Determine Winner Result:", { logs, errors });
};

main().catch(console.error);
