"use client";

import { FC, useRef } from "react";
import DummyGame from "@/components/game/dummy-multi";
import MultiplayerCardGame from "@/components/game/index-multi";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import MultiplayerCursors from "@/components/multiplayer/multiplayer-cursors";
import { LiveProvider } from "@/lib/liveblocks";
import { useParams } from "next/navigation";
import { useMyPresence, useOthers } from "@liveblocks/react";

const GamePage: FC = () => {
    const { session } = useParams(); // Correct way to get the dynamic segment from the URL
    const canvasRef = useRef<HTMLDivElement>(null);
    // console.log("Session: ", session);
    const roomId = Array.isArray(session) ? session[0] : session;

    const [myPresence, updateMyPresence] = useMyPresence();
    const others = useOthers();

    const isPlayer1 = others.length === 0;
    const isPlayer2 = others.length === 1;

    console.log("Role:", isPlayer1 ? "Player 1" : (isPlayer2 ? "Player 2" : "Waiting..."));

  // Update presence with player's role
    updateMyPresence({ role: isPlayer1 ? "Player 1" : (isPlayer2 ? "Player 2" : "Waiting...") });
    
    if (!roomId) {
      return <div>No room ID provided</div>;
    }

    return (
        
        <DynamicIslandProvider initialSize="compact">
            <div className="container h-fit relative" ref={canvasRef}>
                <h1 className="null"></h1>
                    <MultiplayerCardGame isPlayer1={isPlayer1}/>
                <MultiplayerCursors canvas={canvasRef} />
            </div>
        </DynamicIslandProvider>
    );
};

export default GamePage;
