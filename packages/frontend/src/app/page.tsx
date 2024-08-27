"use client";

import React, { useEffect, useState } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cat, Dog, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Component() {
  const { isLoggedIn, getUserInfo } = useWeb3Auth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLoggedIn) {
        try {
          const info = await getUserInfo();
          setUserInfo(info);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      } else {
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, [isLoggedIn, getUserInfo]);

  const handleUniswapClick = () => {
    toast({
      title: "Coming Soon!",
      description: "Uniswap integration will be available in the near future.",
      duration: 3000,
    });
  };

  const handleStartAdventure = () => {
    if (isLoggedIn) {
      router.push("/open-packs");
    } else {
      toast({
        title: "Connect Wallet Required",
        description:
          "Please click the 'Connect Wallet' button to start your adventure.",
      });
    }
  };

  return (
    <div className="min-h-screen pt-8">
      <div className="relative max-w-7xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-4 border-primary">
          <div className="p-6 space-y-6">
            <h1 className="text-4xl font-bold hidden text-center text-primary animate-bounce">
              Welcome to Cats, Dogs and Memes!
            </h1>

            {isLoggedIn && userInfo ? (
              <div className="text-2xl text-center font-semibold text-green-600 bg-green-100 p-4 rounded-lg">
                Welcome back, {userInfo.name || "Awesome Player"}! 🎉
              </div>
            ) : (
              <div className="text-xl text-center font-medium text-blue-600 bg-blue-100 p-4 rounded-lg">
                Please login to access all features and start your adventure!
              </div>
            )}

            <div className="bg-yellow-300 p-4 rounded-lg text-center font-bold text-xl animate-pulse">
              🎉 Season 1 is LIVE! 🎉
            </div>

            {/* Grid with 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Game Info */}
              <Card className="bg-secondary/10 p-4">
                <h2 className="text-2xl font-bold mb-2">Game Info:</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Blockchain-based collectible cards</li>
                  <li>Compete in tournaments for rewards</li>
                  <li>Trade cards with other players</li>
                  <li>Regular updates and new card releases</li>
                </ul>
              </Card>
              {/* Banner Image */}
              <div className="relative h-52 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-lg overflow-hidden group">
                <Image
                  src="/Season1_1.jpg"
                  alt="Banner"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:animate-pulse group-hover:opacity-100">
                  <Cat className="w-24 h-24 text-white animate-bounce" />
                  <Dog className="w-24 h-24 text-white animate-bounce delay-100" />
                  <Smile className="w-24 h-24 text-white animate-bounce delay-200" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Collect, Trade, Battle!
                </div>
              </div>

              {/* How to Play */}
              <Card className="bg-primary/10 p-4 h-52">
                <h2 className="text-2xl font-bold mb-2">How to Play:</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Collect unique cards featuring dogs, cats, and memecoins
                  </li>
                  <li>Build a deck of 10 cards</li>
                  <li>Battle opponents in turn-based combat</li>
                  <li>Win by scoring 4 points first!</li>
                </ol>
              </Card>
            </div>

            <Button
              className="w-full text-lg py-6"
              size="lg"
              onClick={handleStartAdventure}
            >
              {isLoggedIn
                ? "Start Your Adventure!"
                : "Login to Play by Connecting your MPC Wallet"}
            </Button>

            <div className="mt-8">
              <div className="flex justify-center mb-8">
                <div className="h-16 md:h-20 bg-bg rounded-lg flex items-center justify-center px-4">
                  <Image
                    src="/eth-online.png"
                    alt="Hackathon Logo 2024"
                    width={200}
                    height={200}
                  />
                </div>
              </div>

              {/* Sponsored by Section */}
              <h3 className="text-xl font-bold mb-4 text-center">
                Sponsored by:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-center">
                  <Image
                    src="/chainlink.png"
                    alt="Chainlink"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <Image
                    src="/sign.png"
                    alt="Sign"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <Image
                    src="/web3auth.png"
                    alt="Web3Auth"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <Image
                    src="/eth-online.png"
                    alt="Ethereum"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Animated Cryptocurrency Logo with Disabled Uniswap Link */}
        <motion.div
          className="absolute -top-16 -right-16 w-32 h-32 cursor-pointer"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          onClick={handleUniswapClick}
        >
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-600 to-yellow-200 shadow-lg"
            animate={{ rotateY: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Image
              src="/Mascot1.png"
              alt="Cryptocurrency Logo"
              className="w-full h-full object-cover rounded-full"
              width={100}
              height={100}
            />
          </motion.div>
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Buy on Uniswap
          </motion.div>
        </motion.div>

        {/* Redeem Pack Coins Button with Pop Art Splash */}
        <motion.div
          className="absolute -top-16 -left-16 w-48 h-48"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <radialGradient
                id="splash"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="#FF1493" />
                <stop offset="100%" stopColor="#FF69B4" />
              </radialGradient>
            </defs>
            <path
              d="M41,-51.3C52.1,-44.7,59.4,-31.6,65.1,-16.8C70.8,-2,74.9,14.4,69.9,27.3C64.9,40.3,50.8,49.8,36.4,56.6C22,63.4,7.3,67.5,-8.9,68.1C-25.1,68.7,-50.1,65.8,-65.8,52.9C-81.5,40,-87.8,17.1,-84.6,-3.2C-81.4,-23.5,-68.7,-41.2,-53.3,-48.1C-37.8,-55,-18.9,-51.1,-1.6,-49C15.7,-46.9,31.4,-46.7,41,-51.3Z"
              transform="translate(100 100)"
              fill="url(#splash)"
            />
          </svg>
          <Link href="/redeem-pack-coins">
            <motion.button
              className="absolute top-1/2 left-1/2 transform  bg-yellow-400 text-black font-bold py-2 px-4 rounded-full text-sm whitespace-nowrap"
              whileHover={{ scale: 1.1 }}
            >
              Redeem Pack Coins
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
