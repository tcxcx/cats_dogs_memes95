import { useState } from "react";
import { GameStateLog, Deck } from "@/lib/types";
import { useWeb3Auth } from "@/lib/context/web3auth";

export function useGameActions() {
  const { rpc } = useWeb3Auth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAction = async (action: string, inputs: any) => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await rpc?.getAccounts();
      const address = accounts?.[0];
      if (!address) throw new Error("No accounts available");

      const response = await fetch(`/api/rollup/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msgSender: address, ...inputs }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const initializeGame = (deckP1: Deck, deckP2: Deck) =>
    executeAction("initializeGame", { deckP1, deckP2 });

  const playTurn = (
    handIndexP1: number,
    powIndexP1: number,
    handIndexP2: number,
    powIndexP2: number
  ) =>
    executeAction("playTurn", {
      handIndexP1,
      powIndexP1,
      handIndexP2,
      powIndexP2,
    });

  const finalizeGame = (
    playerScore: number,
    opponentScore: number,
    turnCount: number,
    gameLog: GameStateLog
  ) =>
    executeAction("finalizeGame", {
      playerScore,
      opponentScore,
      turnCount,
      gameLog: JSON.stringify(gameLog),
    });

  return { initializeGame, playTurn, finalizeGame, loading, error };
}
