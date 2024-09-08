import { useState, useCallback } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { encodeFunctionData } from "viem";

export const usePlayerAction = () => {
  const { rpc } = useWeb3Auth();
  const [isPlayerActing, setIsPlayerActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);

  const playerAction = useCallback(

    async (to: string, value: number, calldata: string) => {
      if (!rpc) {
        setError("Web3Auth RPC instance is not available");
        return;
      }
      
      setIsPlayerActing(true);
      setError(null);
      setReply(null);

      try {
        const result = await rpc.playerAction(to, value, calldata); 
        setReply(result.reply); 
      } catch (err) {
        setError((err as Error).message || "Error creating player");
      } finally {
        setIsPlayerActing(false);
      }
    },
    [rpc]
  );

  //////////////////////////////////////////////
  ///// EXAMPLE OF VIEM encodeFunctionData /////
  ////////////////////////////////////////////// 
  // step 1: get the abi. 
  //  const cardsContractABI = [
  //   {
  //     inputs: [
  //       { internalType: "uint256", name: "cardPackNo", type: "uint256" },
  //     ],
  //     name: "openCardPack",
  //     outputs: [],
  //     stateMutability: "payable",
  //     type: "function",
  //   }
  //   // other functions...
  // ];

  // const encodedFunctionCall1 = encodeFunctionData({
  //   abi: cardsContractABI,
  //   functionName: 'openCardPack', 
  //   args: [42]
  // })
  // console.log("encodedFunctionCall: ", encodedFunctionCall1) // => 0xe5c291d40000000000000000000000000000000000000000000000000000000000000005

  // const graffitiContractABI = [
  //   {
  //     inputs: [
  //       { internalType: "uint256", name: "mark", type: "uint256" },
  //     ],
  //     name: "leaveYourMark",
  //     outputs: [],
  //     stateMutability: "nonpayable",
  //     type: "function",
  //   }
  // ];

  // //step 2: encode function data with viem's encodeFunctionData function.   
  // const encodedFunctionCall2 = encodeFunctionData({
  //   abi: graffitiContractABI,
  //   functionName: 'leaveYourMark', 
  //   args: [42]
  // })
  // console.log("encodedFunctionCall: ", encodedFunctionCall2)   // => 0xedf03734000000000000000000000000000000000000000000000000000000000000002a
  // the address is: 0xAb8C015e1cE576948e48dBBf2DE322f821BC858A

  //////////////////////////////////////////////////
  ///// END EXAMPLE OF VIEM encodeFunctionData ///// 
  //////////////////////////////////////////////////

  return { playerAction, isPlayerActing, error, reply };
};