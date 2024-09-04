'use client'

import { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Progress } from "@v1/ui/progress";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import { Users, Link as LinkIcon, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@v1/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@v1/ui/tooltip";
import { useRouter, usePathname } from "next/navigation";
import { LiveProvider } from "@/lib/liveblocks";
import { useRoom } from "@liveblocks/react";

// generate a random room ID
const generateRoomID = () => Math.random().toString(36).substring(2, 9);

const MultiplayerLobby: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [inviteLink, setInviteLink] = useState('');
  const [playerCount, setPlayerCount] = useState(1);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [roomId, setRoomId] = useState(generateRoomID()); // Generate a random room ID
  const room = useRoom(); // Access the room state

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const diff = Math.random();
        return Math.min(oldProgress + diff, 100);
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    // Check for player count changes in the room
    if (room) {
      const unsubscribe = room.subscribe("others", (others) => {
        setPlayerCount(others.length + 1); // Update player count (others + self)

        // Redirect to multiplayer game page when 2 players are present
        if (others.length === 1) {
          const newPath = `/play/multiplayer/${roomId}`;
          router.push(newPath);
        }
      });
      return () => unsubscribe();
  }
  }, [room, router, roomId, pathname]);

  const generateInviteLink = () => {
    const link = `${window.location.origin}/play/multiplayer/${roomId}`;
    setInviteLink(link)
    setIsLinkCopied(false)
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setIsLinkCopied(true)
    toast({
      title: "Link Copied!",
      description: "The invite link has been copied to your clipboard.",
      onTimeUpdate: () => {
        setTimeout(() => {
          setIsLinkCopied(false);
        }, 500);
      },
    })
  }

  const playerJoined = () => {
    if (playerCount < 2) {
      setPlayerCount((prevCount) => Math.min(prevCount + 1, 2));
      toast({
        title: "New Player Joined!",
        description: `Player ${playerCount + 1} has entered the lobby.`,
      })
    }
    if (playerCount >= 2) {
      router.push(`/play/multiplayer/${roomId}`);
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
            className="text-4xl font-bold text-gray-800 mb-8 font-departure"
          >
            Multiplayer Lobby
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-opacity-40 bg-white rounded-lg p-6 shadow-lg max-w-md w-full"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between opacity-90 font-departure">
              Waiting for players...
              <span className="text-lg font-departure">
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
              <Button onClick={playerJoined} className="w-full bg-green-500 hover:bg-green-600 font-departure">
                Simulate Player Joining
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 text-gray-700 text-center font-departure"
          >
            <p>The game will start automatically when all players have joined.</p>
          </motion.div>
        </div>
      </TooltipProvider>
    </DynamicIslandProvider>
  )
}

export default MultiplayerLobby
