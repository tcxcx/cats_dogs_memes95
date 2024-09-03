"use client";

import { FC, useRef } from "react";
import Game from "@/components/game";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";

const GamePage: FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  return (
    <DynamicIslandProvider initialSize="compact">
      <div className="container h-fit relative" ref={canvasRef}>
        <h1 className="null"></h1>
        {/* Game */}
        <Game />
      </div>
    </DynamicIslandProvider>
  );
};

export default GamePage;
