// Hook to check if a user already owns an avatar. This hook is used in the wallet to prompt the user to add an Avatar or not.

import { useState, useEffect, useCallback } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";
import EthereumRpc from "@/lib/viemRPC";

export const useHasPlayer = () => {
  const { rpc } = useWeb3Auth();
  const [hasPlayer, setHasPlayer] = useState<boolean>(false);
  const [avatarImage, setAvatarImage] = useState<string>("");

  const checkPlayerOwnership = useCallback(async () => {
    if (!rpc) {
      console.error("Web3Auth RPC instance is not available");
      return;
    }

    try {
      const accounts = await rpc.getAccounts();
      if (accounts.length === 0) {
        setHasPlayer(false);
        return;
      }

      const playerAddress = await rpc.getAvatarAddress(Number(accounts[0]));
      if (playerAddress && playerAddress !== "0x0000000000000000000000000000000000000000") {
        setHasPlayer(true);
// ***************************
        const avatarURI = "https://example.com/avatar.png"; // Replace with actual URI
        setAvatarImage(avatarURI);
      } else {
        setHasPlayer(false);
      }
    } catch (error) {
      console.error("Error checking player ownership:", error);
      setHasPlayer(false);
    }
  }, [rpc]);

  useEffect(() => {
    checkPlayerOwnership();
  }, [checkPlayerOwnership]);

  return { hasPlayer, avatarImage };
};
