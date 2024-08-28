import { useState } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { TransactionReceipt } from "viem";

export const useOpenCardPack = () => {
  const { rpc } = useWeb3Auth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const openCardPack = async (cardPackNo: number, value: string) => {
    if (!rpc) {
      setError("Web3Auth RPC instance is not available");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setReceipt(null);

    try {
      const txReceipt = await rpc.openCardPack(cardPackNo, value);
      setReceipt(txReceipt);
    } catch (err) {
      setError((err as Error).message || "Error opening card pack");
    } finally {
      setIsProcessing(false);
    }
  };

  return { openCardPack, isProcessing, error, receipt };
};
