"use client";

import { FC, useEffect, useState } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";
import LoadingSpinner from "@/components/loading-spinner";

interface LoadingCheckWrapperProps {
  children: React.ReactNode;
}

const LoadingCheckWrapper: FC<LoadingCheckWrapperProps> = ({ children }) => {
  const { rpc, isLoggedIn } = useWeb3Auth();
  const [isReady, setIsReady] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoggedIn) {
        setHasTimedOut(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isLoggedIn]);

  useEffect(() => {
    if (rpc && isLoggedIn) {
      setIsReady(true);
    }
  }, [rpc, isLoggedIn]);

  if (hasTimedOut && !isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Please connect your wallet to continue.</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingCheckWrapper;
