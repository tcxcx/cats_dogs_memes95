"use client";

import { FC, useRef, useEffect } from "react";
import MultiplayerCardGame from "@/components/game/index-multi";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import MultiplayerCursors from "@/components/multiplayer/multiplayer-cursors";
import { useParams } from "next/navigation";
import { useMyPresence, useOthers, LiveblocksProvider, RoomProvider } from "@liveblocks/react";

const GamePage: FC = () => {
    const { session } = useParams(); // Correct way to get the dynamic segment from the URL
    const canvasRef = useRef<HTMLDivElement>(null);
    const roomId = Array.isArray(session) ? session[0] : session;
    
    if (!roomId) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-semibold mb-4">Room ID Not Found</h2>
              <p className="text-gray-600 mb-6">It seems like the room you are trying to join is unavailable.</p>
              <button
                onClick={() => window.location.href = '/play/lobby'} // Adjust this path to your actual lobby route
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
              >
                Go Back to Lobby
              </button>
            </div>
          </div>
        );
      }

    return (
        <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_KEY!}>
            <RoomProvider id={`room-${roomId}`}>
                <GameContent roomId={roomId} canvasRef={canvasRef} />
            </RoomProvider>
        </LiveblocksProvider>
    );
};

const GameContent: FC<{ roomId: string; canvasRef: React.RefObject<HTMLDivElement> }> = ({ roomId, canvasRef }) => {
    const [myPresence, updateMyPresence] = useMyPresence();
    const others = useOthers();

    const existingRoles = others.map((other) => other.presence.role);
    const isPlayer1Taken = existingRoles.includes("Player 1");
    const isPlayer2Taken = existingRoles.includes("Player 2");

    useEffect(() => {
        // Check current presence and update only if not set to prevent overwriting
        if (!myPresence.role) {
          let newRole;
          if (!isPlayer1Taken) {
            newRole = "Player 1";
          } else if (!isPlayer2Taken) {
            newRole = "Player 2";
          } else {
            newRole = "Spectator"; // Default to "Spectator" if both player roles are taken
          }
          updateMyPresence({ role: newRole });
          console.log("Assigned role:", newRole);
        }
      }, [myPresence, updateMyPresence, isPlayer1Taken, isPlayer2Taken]);

    const role = typeof myPresence.role === "string" ? myPresence.role : "Connecting...";

    return (
        <DynamicIslandProvider initialSize="compact">
            <div className="container h-fit relative" ref={canvasRef}>
                <div className="player-info absolute top-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-3 py-2 rounded-md shadow-md text-center">
                    <h2 className="text-sm font-medium">Logged In As: {role}</h2>
                </div>

                <div className="container h-fit relative mt-16" ref={canvasRef}> {/* Added margin to push content down */}
                {/* Multiplayer Game Content */}
                    <MultiplayerCardGame isPlayer1 = {role === "Player 1"} isPlayer2={role === "Player 2"} />
                    <MultiplayerCursors canvas={canvasRef} />
                </div>
            </div>
        </DynamicIslandProvider>
    );
};

export default GamePage;
