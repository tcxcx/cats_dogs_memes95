"use client";

import { FC, useEffect, useState, useRef } from "react";
import Game from "@/components/game";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { useMruInfo } from "@/lib/hooks/useMruInfo";

const GamePage: FC = () => {
  const { rpc, isLoggedIn } = useWeb3Auth();
  const { mruInfo, isLoading: mruLoading } = useMruInfo();
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if all necessary conditions are met to start the game
    if (rpc && isLoggedIn && mruInfo && !mruLoading) {
      setIsReady(true);
    }
  }, [rpc, isLoggedIn, mruInfo, mruLoading]);

  if (!isReady) {
    // Render loading state while the conditions are not met
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Loading game...</p>
          {/* Optionally add a spinner or any loading animation here */}
          <div className="loader mt-4"></div>
        </div>
      </div>
    );
  }

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
