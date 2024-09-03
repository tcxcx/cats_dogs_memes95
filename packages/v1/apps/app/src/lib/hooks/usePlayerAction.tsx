import { useState, useCallback } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";

// This usePlayerAction hook the following params: 
// - avatarBasedAccount: the avatarBasedAccount address (which has to belong to the player). 
// - to: the address to call  
// - value: the amount of ether to send in the transaction. 
// - calldata: the encoded call to the contract. 

// An example of constructing the calldata, calling openCardPack:  
// const callData = encodeFunctionData({
//  abi: cardsContractABI,
//  functionName: 'openCardPack', 
//  args: [4]
// })

// That's it. I hope it makes sense. 

export const usePlayerAction = (avatarAddress: string) => {
  const { rpc } = useWeb3Auth();
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);

  const playerAction = useCallback(
    async (avatarBasedAccount: string, to: string, value: bigint, calldata: string) => {
      if (!rpc) {
        setError("Web3Auth RPC instance is not available");
        return;
      }

      setIsActing(true);
      setError(null);
      setReply(null);

      try {
        const result = await rpc.playerAction(avatarBasedAccount, to, value, calldata); 
        setReply(result.reply); 
      } catch (err) {
        setError((err as Error).message || "Error creating player");
      } finally {
        setIsActing(false);
      }
    },
    [rpc]
  );

  return { playerAction, isActing, error, reply };
};
