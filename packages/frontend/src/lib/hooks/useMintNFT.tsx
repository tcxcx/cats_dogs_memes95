import { useState } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { TransactionReceipt } from "viem";

export const useMintNFT = () => {
  const { rpc } = useWeb3Auth();
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintReceipt, setMintReceipt] = useState<TransactionReceipt | null>(null);

  const mintNFT = async (recipient: string, tokenURI: string) => {
    if (!rpc) {
      setMintError("Web3Auth RPC instance is not available");
      return;
    }

    setIsMinting(true);
    setMintError(null);
    setMintReceipt(null);

    try {
      const receipt = await rpc.mintNFT(recipient, tokenURI);
      setMintReceipt(receipt);
    } catch (error) {
      setMintError((error as Error).message || "Error minting NFT");
    } finally {
      setIsMinting(false);
    }
  };

  return { mintNFT, isMinting, mintError, mintReceipt };
};

// import React, { useState } from "react";
// import { useMintNFT } from "@/hooks/useMintNFT";
// import { Button, Input } from "@/components/ui";

// const MintNFTComponent = () => {
//   const { mintNFT, isMinting, mintError, mintReceipt } = useMintNFT();
//   const [recipient, setRecipient] = useState("");
//   const [tokenURI, setTokenURI] = useState("");

//   const handleMint = async () => {
//     if (recipient && tokenURI) {
//       await mintNFT(recipient, tokenURI);
//     }
//   };

//   return (
//     <div>
//       <h1>Mint Your NFT</h1>
//       <Input
//         type="text"
//         value={recipient}
//         onChange={(e) => setRecipient(e.target.value)}
//         placeholder="Recipient Address"
//       />
//       <Input
//         type="text"
//         value={tokenURI}
//         onChange={(e) => setTokenURI(e.target.value)}
//         placeholder="Token URI"
//       />
//       <Button onClick={handleMint} disabled={isMinting}>
//         {isMinting ? "Minting..." : "Mint NFT"}
//       </Button>
//       {mintError && <p style={{ color: "red" }}>{mintError}</p>}
//       {mintReceipt && <p>NFT Minted Successfully. Transaction Hash: {mintReceipt.transactionHash}</p>}
//     </div>
//   );
// };

// export default MintNFTComponent;
