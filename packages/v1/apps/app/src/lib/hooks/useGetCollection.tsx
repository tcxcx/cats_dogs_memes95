import { useState, useCallback } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";

export const useGetCollection = () => {
  const { rpc } = useWeb3Auth();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<number[] | null>(null);

  const getCollection = useCallback(
    async (avatarAccountAddress: string) => {
      if (!rpc) {
        setError("Web3Auth RPC instance is not available");
        return;
      }

      setIsFetching(true);
      setError(null);
      setCollection(null);

      try {
        const cardCollection = await rpc.getCollection(avatarAccountAddress);
        setCollection(cardCollection);
      } catch (err) {
        setError((err as Error).message || "Error fetching card collection");
      } finally {
        setIsFetching(false);
      }
    },
    [rpc]
  );

  return { getCollection, isFetching, error, collection };
};

// Use the useGetCollection hook in your React component like this:


// import React, { useEffect } from "react";
// import { useGetCollection } from "@/hooks/useGetCollection";

// const CollectionComponent = ({ avatarAccountAddress }: { avatarAccountAddress: string }) => {
//   const { getCollection, isFetching, error, collection } = useGetCollection();

//   useEffect(() => {
//     if (avatarAccountAddress) {
//       getCollection(avatarAccountAddress);
//     }
//   }, [avatarAccountAddress, getCollection]);

//   if (isFetching) {
//     return <div>Loading collection...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div>
//       <h2>Card Collection:</h2>
//       {collection ? (
//         <ul>
//           {collection.map((count, index) => (
//             <li key={index}>
//               Card ID {index}: {count} owned
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <div>No cards found.</div>
//       )}
//     </div>
//   );
// };

// export default CollectionComponent;
