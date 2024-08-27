"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import Image from "next/image";

// Mock data - replace with actual data fetching logic
const mockUserData = {
  coins: 500,
};

export default function FaucetPage() {
  const [userData, setUserData] = useState(mockUserData);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    // Fetch user data here
    // setUserData(fetchedData);
  }, []);

  const handleRedeem = () => {
    setIsRedeeming(true);
    // Simulate redeeming process
    setTimeout(() => {
      setUserData((prevData) => ({
        ...prevData,
        coins: prevData.coins + 100,
      }));
      setIsRedeeming(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>You can redeem</span>
            <motion.div
              className="flex items-center"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Coins className="w-6 h-6 mr-2 text-yellow-500" />
              <span className="text-2xl font-bold">{userData.coins}</span>
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-600 to-yellow-200 shadow-lg">
              <Image
                src="/Mascot1.png"
                alt="Cryptocurrency Logo"
                className="w-full h-full object-cover rounded-full"
                width={100}
                height={100}
              />
            </div>
          </div>
          <Button
            onClick={handleRedeem}
            disabled={isRedeeming}
            className="w-full"
          >
            {isRedeeming ? "Redeeming..." : "Redeem Coins"}
          </Button>
          {isRedeeming && <Progress value={66} className="mt-2" />}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="text-center p-4">
          <p className="text-lg mb-2">Need more coins?</p>
          <p className="text-sm text-muted-foreground">
            Play games, purchase packs, or purchase coins from uniswap to
            increase your balance!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
