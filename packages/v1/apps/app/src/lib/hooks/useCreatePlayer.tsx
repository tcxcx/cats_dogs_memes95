import { useState, useCallback } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";

export const useCreatePlayer = () => {
  const { rpc } = useWeb3Auth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [avatarAddress, setAvatarAddress] = useState<string | null>(null);

  const createPlayer = useCallback(
    async (avatarURI: string) => {
      if (!rpc) {
        setError("Web3Auth RPC instance is not available");
        return;
      }

      setIsCreating(true);
      setError(null);
      setAvatarId(null);
      setAvatarAddress(null);

      try {
        const result = await rpc.createPlayer(avatarURI);
        setAvatarId(result.avatarId);
        setAvatarAddress(result.avatarAddress);
      } catch (err) {
        setError((err as Error).message || "Error creating player");
      } finally {
        setIsCreating(false);
      }
    },
    [rpc]
  );

  return { createPlayer, isCreating, error, avatarId, avatarAddress };
};




// import React, { useState } from "react";
// import { useCreatePlayer } from "@/hooks/useCreatePlayer";
// import { Button, Input } from "@/components/ui";

// const CreatePlayerComponent = () => {
//   const { createPlayer, isCreating, error, avatarId, avatarAddress } = useCreatePlayer();
//   const [avatarURI, setAvatarURI] = useState("");

//   const handleCreatePlayer = async () => {
//     if (avatarURI) {
//       await createPlayer(avatarURI);
//     }
//   };

//   return (
//     <div>
//       <h1>Create Your Player Avatar</h1>
//       <Input
//         type="text"
//         value={avatarURI}
//         onChange={(e) => setAvatarURI(e.target.value)}
//         placeholder="Avatar URI"
//       />
//       <Button onClick={handleCreatePlayer} disabled={isCreating}>
//         {isCreating ? "Creating..." : "Create Player"}
//       </Button>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {avatarId && avatarAddress && (
//         <p>Player Created Successfully. Avatar ID: {avatarId}, Avatar Address: {avatarAddress}</p>
//       )}
//     </div>
//   );
// };

// export default CreatePlayerComponent;
