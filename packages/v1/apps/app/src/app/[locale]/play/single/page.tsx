"use client";

import { FC, useRef } from "react";
import Game from "@/components/game";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import LoadingCheckWrapper from "@/components/loading-wrap-check";

const GamePage: FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <LoadingCheckWrapper>
      <DynamicIslandProvider initialSize="compact">
        <div className="container flex h-fit max-w-fit justify-center relative" ref={canvasRef}>
          <h1 className="null"></h1>
          <Game />
        </div>
      </DynamicIslandProvider>
    </LoadingCheckWrapper>
  );
};

export default GamePage;
