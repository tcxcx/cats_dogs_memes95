'use client'

import { FC, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@v1/ui/button"
import { Input } from "@v1/ui/input"
import { Progress } from "@v1/ui/progress"
import { DynamicIslandProvider } from "@v1/ui/dynamic-island"
import { Users, Link as LinkIcon, Copy, CheckCircle } from "lucide-react"
import { useToast } from "@v1/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@v1/ui/tooltip"

const MultiplayerLobby: FC = () => {
  const [inviteLink, setInviteLink] = useState("")
  const [playerCount, setPlayerCount] = useState(1)
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const diff = Math.random()
        return Math.min(oldProgress + diff, 100)
      })
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const generateInviteLink = () => {
    const link = `${window.location.origin}/play/multiplayer?session=${Date.now()}`
    setInviteLink(link)
    setIsLinkCopied(false)
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setIsLinkCopied(true)
    toast({
      title: "Link Copied!",
      description: "The invite link has been copied to your clipboard.",
    })
  }

  const playerJoined = () => {
    if (playerCount < 2) {
      setPlayerCount(playerCount + 1)
      toast({
        title: "New Player Joined!",
        description: `Player ${playerCount + 1} has entered the lobby.`,
      })
    }
  }

  return (
    <DynamicIslandProvider initialSize="compact">
      <TooltipProvider>
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-800 mb-8"
          >
            Multiplayer Lobby
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-opacity-40 bg-white rounded-lg p-6 shadow-lg max-w-md w-full"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center justify-between opacity-90">
              Waiting for players...
              <span className="text-lg font-normal">
                <Users className="inline mr-2" />
                {playerCount}/2
              </span>
            </h2>
            <div className="flex justify-center mb-4 relative">
              <Image
                src="/Season1_2.jpg"
                alt="Waiting for players"
                width={200}
                height={200}
                className="flex w-full h-fit rounded-lg"
              />
              <AnimatePresence>
                {playerCount > 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-2"
                  >
                    <Users size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Progress value={progress} className="mb-4" />
            <div className="space-y-4">
              <Button
                onClick={generateInviteLink}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <LinkIcon className="mr-2" /> Generate Invite Link
              </Button>
              {inviteLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2"
                >
                  <Input value={inviteLink} readOnly className="flex-grow" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={copyInviteLink} variant="noShadow">
                        {isLinkCopied ? <CheckCircle className="text-green-500" /> : <Copy />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isLinkCopied ? "Copied!" : "Copy to clipboard"}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
              <Button onClick={playerJoined} className="w-full bg-green-500 hover:bg-green-600">
                Simulate Player Joining
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 text-gray-700 text-center"
          >
            <p>The game will start automatically when all players have joined.</p>
          </motion.div>
        </div>
      </TooltipProvider>
    </DynamicIslandProvider>
  )
}

export default MultiplayerLobby
/*
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

export default GamePage;*/