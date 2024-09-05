import { useState, useCallback } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { encodeFunctionData } from "viem";

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

export const usePlayerAction = () => {
  const { rpc } = useWeb3Auth();
  const [isPlayerActing, setIsPlayerActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);

  //////////////////////////////////////////////
  ///// EXAMPLE OF VIEM encodeFunctionData /////
  ////////////////////////////////////////////// 
  // step 1: get the abi. 
   const cardsContractABI = [
    {
      inputs: [
        { internalType: "uint256", name: "cardPackNo", type: "uint256" },
      ],
      name: "openCardPack",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    }
    // other functions...
  ];

  //step 2: encode function data with viem's encodeFunctionData function.   
  const encodedFunctionCall = encodeFunctionData({
    abi: cardsContractABI,
    functionName: 'openCardPack', 
    args: [5]
  })
  // console.log("encodedFunctionCall: ", encodedFunctionCall) // => 0xe5c291d40000000000000000000000000000000000000000000000000000000000000005
  //////////////////////////////////////////////
  ///// EXAMPLE OF VIEM encodeFunctionData ///// 
  //////////////////////////////////////////////
  console.log("usePlayerAction waypoint 1"); 
  const playerAction = useCallback(
    async (avatarBasedAddress:  `0x${string}`, to: string, value: number, calldata: string) => {
      if (!rpc) {
        setError("Web3Auth RPC instance is not available");
        return;
      }

      setIsPlayerActing(true);
      setError(null);
      setReply(null);

      try {
        const result = await rpc.playerAction(avatarBasedAddress, to, value, calldata); 
        setReply(result.reply); 
      } catch (err) {
        setError((err as Error).message || "Error creating player");
      } finally {
        setIsPlayerActing(false);
      }
    },
    [rpc]
  );

  return { playerAction, isPlayerActing, error, reply };
};
