// GamePage.tsx

'use client'

import { FC } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@v1/ui/button"
import { DynamicIslandProvider } from "@v1/ui/dynamic-island"

const gameLandingPage: FC = () => {
  return (
    <DynamicIslandProvider initialSize="compact">
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-departure text-gray-800 mb-8"
        >
          Ready to Play?
        </motion.h1>
        <div className="flex flex-col sm:flex-row gap-8">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Image
              src="/singleplayer.jpg"
              alt="Single Player"
              width={300}
              height={300}
              className="rounded-lg shadow-lg"
            />
            <Link href="/play/single">
              <Button className="absolute top-3 right-3 w-[55%] h-[20%] text-lg bg-blue-200 opacity-85 font-departure">
                Single Player
              </Button>
            </Link>
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Image
              src="/multiplayer.jpg"
              alt="Multiplayer"
              width={300}
              height={300}
              className="rounded-lg shadow-lg"
            />
            <Link href="/play/lobby">
              <Button className="absolute top-3 left-3 w-[55%] h-[20%] text-lg bg-yellow-300 opacity-80 font-departure">
                Multiplayer
              </Button>
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 text-gray-700 text-center"
        >
          <p className="text-xl mb-2 font-departure">
            Get ready for an exciting gaming experience!
          </p>
          <p className="font-departure">
            Choose your mode and start playing now.
          </p>
        </motion.div>
      </div>
    </DynamicIslandProvider>
  )
}

export default gameLandingPage

/*
"use client";

import { FC, useRef } from "react";
import Game from "@/components/game";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import { Button } from "@v1/ui/button";
import MultiplayerCursors from "@/components/multiplayer/multiplayer-cursors";

const GamePage: FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const singlePlayer = true;
  return (
    <DynamicIslandProvider initialSize="compact">
      <div className="container w-fit h-fit align-items-center relative" ref={canvasRef}>
        <h1 className="null">
          Clever Header Here
        </h1>
        <div className="flex align-middle w-fit h-fit">
        <Button
          className="flex bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md align-middle"
          onClick={() => {
            window.location.href = "/play/single";
          }}
        >
          Single Player
          <span className="ml-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </Button>
        
        <Button
          className="flex bg-yellow-500 text-white hover:bg-yellow-600 px-4 py-2 rounded-md align-middle"
          onClick={() => {
            window.location.href = "/play/multiplayer";
          }}
        >
          Multiplayer
          <span className="ml-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </Button>
        </div>
      </div>
    </DynamicIslandProvider>
  );
};

export default GamePage;
*/