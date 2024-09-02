"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import LoadingScreen from "@/components/skeletons/loading-screen";

export default function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider
      publicApiKey={
        process.env.LIVEBLOCKS_KEY ||
        "pk_prod_iTlsn6kbhJasd2GVNK6saDrm2EwFh6gnefWzYwIZZ43m42KAQIMGAOwHQCe8TkiD"
      }
    >
      <RoomProvider id="my-room">
        <ClientSideSuspense fallback={<LoadingScreen loading={true} />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
