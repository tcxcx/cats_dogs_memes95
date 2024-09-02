// GamePage.tsx

"use client";

import { FC, useRef } from "react";
import Game from "@/components/game";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import MultiplayerCursors from "@/components/multiplayer/multiplayer-cursors";

const GamePage: FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <DynamicIslandProvider initialSize="compact">
      <div className="container h-fit relative" ref={canvasRef}>
        <h1 className="null"></h1>
        <Game />
        <MultiplayerCursors canvas={canvasRef} />
      </div>
    </DynamicIslandProvider>
  );
};

export default GamePage;
