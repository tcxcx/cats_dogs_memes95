import { useState } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { TransactionReceipt } from "viem";

export const useMintCoinShare = () => {
  const { rpc } = useWeb3Auth();
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintReceipt, setMintReceipt] = useState<TransactionReceipt | null>(null);

  const mintCoinShare = async () => {
    if (!rpc) {
      setMintError("Web3Auth RPC instance is not available");
      return;
    }

    setIsMinting(true);
    setMintError(null);
    setMintReceipt(null);

    try {
      const receipt = await rpc.mintCoinShare();
      setMintReceipt(receipt);
    } catch (error) {
      setMintError((error as Error).message || "Error minting coin share");
    } finally {
      setIsMinting(false);
    }
  };

  return { mintCoinShare, isMinting, mintError, mintReceipt };
};


// Using the useMintCoinShare Hook in a Component

// import React from "react";
// import { useMintCoinShare } from "@/hooks/useMintCoinShare";
// import { Button } from "@/components/ui";

// const MintCoinShareComponent = () => {
//   const { mintCoinShare, isMinting, mintError, mintReceipt } = useMintCoinShare();

//   const handleMint = async () => {
//     await mintCoinShare();
//   };

//   return (
//     <div>
//       <h1>Mint Your Coin Share</h1>
//       <Button onClick={handleMint} disabled={isMinting}>
//         {isMinting ? "Minting..." : "Mint Coin Share"}
//       </Button>
//       {mintError && <p style={{ color: "red" }}>{mintError}</p>}
//       {mintReceipt && (
//         <p>Coin Share Minted Successfully. Transaction Hash: {mintReceipt.transactionHash}</p>
//       )}
//     </div>
//   );
// };

// export default MintCoinShareComponent;
