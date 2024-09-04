"use client";

import { FC, useRef } from "react";
import DummyGame from "@/components/game/dummy-multi";
//import MultiGame from "@/components/game";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import MultiplayerCursors from "@/components/multiplayer/multiplayer-cursors";
import { LiveProvider } from "@/lib/liveblocks";
import { useParams } from "next/navigation";

const GamePage: FC = () => {
    const { session } = useParams(); // Correct way to get the dynamic segment from the URL
    const canvasRef = useRef<HTMLDivElement>(null);

    const roomId = Array.isArray(session) ? session[0] : session;
  
    if (!roomId) {
      return <div>No room ID provided</div>;
    }

    return (
        <DynamicIslandProvider initialSize="compact">
            <div className="container h-fit relative" ref={canvasRef}>
                <h1 className="null"></h1>
                {/* <MultiGame /> */}
                <DummyGame />
                <MultiplayerCursors canvas={canvasRef} />
            </div>
        </DynamicIslandProvider>
    );
};

export default GamePage;

    /*
    const searchParams = useSearchParams();
    const canvasRef = useRef<HTMLDivElement>(null);
    const roomId = searchParams.get("session");

    if (!roomId) {
        return <div>No room ID provided</div>;
    }
    */
       /*
    <LiveProvider roomId={roomId}>
    </LiveProvider>
    */