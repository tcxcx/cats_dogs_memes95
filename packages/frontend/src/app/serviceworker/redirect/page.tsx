"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth } from "@/lib/context/web3auth";

export default function AuthPage() {
  const router = useRouter();
  const { coreKitInstance } = useWeb3Auth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const initializeCoreKit = async () => {
      if (!coreKitInstance) {
        console.log("Waiting for coreKitInstance to be available...");
        return;
      }

      try {
        setIsProcessing(true);
        console.log("Initializing Web3Auth CoreKit...");
        await coreKitInstance.init();
        console.log("Initialization successful");
      } catch (error) {
        console.error("Failed to initialize CoreKit:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    initializeCoreKit();
  }, [coreKitInstance]);

  if (isProcessing) {
    return <div>Initializing, please wait...</div>;
  }

  return null;
}
