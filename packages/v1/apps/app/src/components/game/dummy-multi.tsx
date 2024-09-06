"use client";

import { FC, useEffect, useState } from "react";
import { useMyPresence, useOthers } from "@liveblocks/react";

// Define the shape of the player state
interface PlayerState {
  x: number; // X position
  y: number; // Y position
  color: string; // Color of the player
  lastClick?: { x: number; y: number }; // Last mouse click position
  isMoving?: boolean; // Whether the player is currently moving
}

const DummyGame: FC = () => {
  // Initialize local player state
  const [player, updateMyPresence] = useMyPresence();

  useEffect(() => {
    // Update player state when my presence changes
    updateMyPresence({ x: 0, y: 0, color: "red", isMoving: false });
  }, []);
  // Get other players' presence
  const others = useOthers();
  
  // Handle mouse movement to update player state
  const handleMouseMove = (event: MouseEvent) => {
    // Update the player position based on the mouse coordinates
    updateMyPresence({ x: event.clientX, y: event.clientY, isMoving: true });
  };

  // Handle mouse click event to perform an action
  const handleMouseClick = (event: MouseEvent) => {
    console.log("Mouse clicked at:", event.clientX, event.clientY);
    updateMyPresence({
        lastClick: { x: event.clientX, y: event.clientY },
    });
  };
  // Attach and detach mouse event listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseClick);
    };
  }, []);

  useEffect(() => {
    others.forEach(({ connectionId, presence }) => {
      const otherPresence = presence as unknown as PlayerState;

      if (otherPresence.isMoving) {
        console.log(`User ${connectionId} is moving to (${otherPresence.x}, ${otherPresence.y})`);
      }
      if (otherPresence.lastClick) {
        console.log(`User ${connectionId} clicked at (${otherPresence.lastClick.x}, ${otherPresence.lastClick.y})`);
      }
    });
  }, [others]); // Re-run this effect whenever others' states change

  // Type-safe style properties
  const playerX = typeof player?.x === "number" ? player.x : 0;
  const playerY = typeof player?.y === "number" ? player.y : 0;
  const playerColor = typeof player?.color === "string" ? player.color : "#000";

  return (
    <div className="relative w-full h-full bg-gray-200 overflow-hidden">
      {/* Render your player */}
      <div
        style={{
          position: "absolute",
          left: playerX,
          top: playerY,
          width: 20,
          height: 20,
          backgroundColor: playerColor,
        }}
      />

      {/* Render other players */}
      {others.map(({ connectionId, presence }) => {
        const otherX = typeof presence?.x === "number" ? presence.x : 0;
        const otherY = typeof presence?.y === "number" ? presence.y : 0;
        const otherColor = typeof presence?.color === "string" ? presence.color : "#000";

        return (
          <div
            key={connectionId}
            style={{
              position: "absolute",
              left: otherX,
              top: otherY,
              width: 20,
              height: 20,
              backgroundColor: otherColor,
            }}
          />
        );
      })}
    </div>
  );
};

export default DummyGame;