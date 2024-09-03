// // packages/v1/packages/rollup/src/index.ts
// import { ActionConfirmationStatus } from "@stackr/sdk";
// import { mru } from "./stackr/mru";
// import {
//   InitializeGameSchema,
//   PlayTurnSchema,
//   FinalizeGameSchema,
// } from "./stackr/schemas";
// import { signMessage } from "./utils";
// import {
//   CardData,
//   Power,
//   GameState,
//   GameLog,
//   GameStateLog,
// } from "@v1/app/types";
// import { userCards } from "@v1/app/mock-cards";
// import { useWeb3Auth, EthereumRpc } from "@v1/app/web3auth";

// const main = async () => {
//   const { rpc, getAccounts } = useWeb3Auth();

//   if (!rpc) {
//     console.error("RPC not initialized");
//     return;
//   }

//   const accounts = await getAccounts();
//   if (accounts.length === 0) {
//     console.error("No accounts found");
//     return;
//   }

//   const address = accounts[0];

//   // Initialize the game
//   const deckP1: string[] = (userCards as CardData[])
//     .slice(0, 10)
//     .map((card) => card.name);
//   const deckP2: string[] = (userCards as CardData[])
//     .slice(10, 20)
//     .map((card) => card.name);

//   const initializeInputs = {
//     deckP1,
//     deckP2,
//   };

//   const initializeSignature = await signMessage(
//     rpc as EthereumRpc,
//     InitializeGameSchema,
//     initializeInputs
//   );
//   const initializeAction = InitializeGameSchema.actionFrom({
//     inputs: initializeInputs,
//     signature: initializeSignature,
//     msgSender: address,
//   });

//   let ack = await mru.submitAction("initializeGame", initializeAction);
//   console.log("Initialize Game Action Hash:", ack.hash);

//   let { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);
//   console.log("Initialize Game Result:", { logs, errors });

//   // Play a turn (example)
//   const playTurnInputs = {
//     handIndexP1: 0,
//     powIndexP1: 0,
//     handIndexP2: 0,
//     powIndexP2: 0,
//   };

//   const playTurnSignature = await signMessage(
//     rpc as EthereumRpc,
//     PlayTurnSchema,
//     playTurnInputs
//   );
//   const playTurnAction = PlayTurnSchema.actionFrom({
//     inputs: playTurnInputs,
//     signature: playTurnSignature,
//     msgSender: address,
//   });

//   ack = await mru.submitAction("playTurn", playTurnAction);
//   console.log("Play Turn Action Hash:", ack.hash);

//   ({ logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1));
//   console.log("Play Turn Result:", { logs, errors });

//   // Finalize the game
//   const gameState = mru.stateMachines.get("cardGame")?.state as GameStateLog;
//   if (!gameState) {
//     console.error("Game state not found");
//     return;
//   }

//   const finalizeGameInputs = {
//     playerScore: gameState.score[0],
//     opponentScore: gameState.score[1],
//     turnCount: gameState.turnCount,
//     gameLog: JSON.stringify(gameState.gameLog),
//   };

//   const finalizeGameSignature = await signMessage(
//     rpc as EthereumRpc,
//     FinalizeGameSchema,
//     finalizeGameInputs
//   );
//   const finalizeGameAction = FinalizeGameSchema.actionFrom({
//     inputs: finalizeGameInputs,
//     signature: finalizeGameSignature,
//     msgSender: address,
//   });

//   ack = await mru.submitAction("finalizeGame", finalizeGameAction);
//   console.log("Finalize Game Action Hash:", ack.hash);

//   ({ logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1));
//   console.log("Finalize Game Result:", { logs, errors });
// };

// main().catch(console.error);

export * from './stackr/mru';
export * from './stackr/schemas';
export * from './stackr/state';
export * from './stackr/transitions';
export * from './stackr/machine';