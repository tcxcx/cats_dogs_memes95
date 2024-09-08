"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
//import { useRouter } from "next/router";
import LoadingScreen from "@/components/skeletons/loading-screen";

interface RoomProps {
  children: ReactNode;
  roomId: string;
}

export default function Room({ children, roomId }: RoomProps) {
  
  /*if (!roomId || typeof roomId !== "string") {
    roomId = "";
    return 
    <div>No room ID provided</div>;
    //<LoadingScreen loading={true} />;
  }*/
  return (
    <LiveblocksProvider
      publicApiKey={
        process.env.NEXT_PUBLIC_LIVEBLOCKS_KEY as string
      }
    >
      <RoomProvider id={`room-${roomId}`}>
        <ClientSideSuspense fallback={<LoadingScreen loading={true} />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
