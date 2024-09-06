"use client";

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
import { useRouter } from "next/navigation";
import { useRoom, useOthers, LiveblocksProvider, RoomProvider } from "@liveblocks/react";

// Generate a random room ID
const generateRoomID = () => Math.random().toString(36).substring(2, 9);

const MultiplayerLobby: FC = () => {
  const router = useRouter();
  const [inviteLink, setInviteLink] = useState('');
  const [playerCount, setPlayerCount] = useState(1);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [roomId] = useState(generateRoomID());
  
  const liveblocksPublicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_KEY!

  const generateInviteLink = () => {
    const link = `${window.location.origin}/play/multiplayer/${roomId}`;
    setInviteLink(link);
    setIsLinkCopied(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsLinkCopied(true);
    toast({
      title: "Link Copied!",
      description: "The invite link has been copied to your clipboard.",
      onTimeUpdate: () => {
        setTimeout(() => {
          setIsLinkCopied(false);
        }, 500);
      },
    });
  };

  return (
    <LiveblocksProvider publicApiKey={liveblocksPublicKey}>
      <RoomProvider id={`room-${roomId}`}>
        <LobbyContent roomId={roomId} router={router} inviteLink={inviteLink} generateInviteLink={generateInviteLink} copyInviteLink={copyInviteLink} isLinkCopied={isLinkCopied} />
      </RoomProvider>
    </LiveblocksProvider>
  );
};

interface LobbyContentProps {
  roomId: string;
  router: ReturnType<typeof useRouter>;
  inviteLink: string;
  generateInviteLink: () => void;
  copyInviteLink: () => void;
  isLinkCopied: boolean;
}
const LobbyContent: FC<LobbyContentProps> = ({
  roomId,
  router,
  inviteLink,
  generateInviteLink,
  copyInviteLink,
  isLinkCopied,
}) => {
  const [playerCount, setPlayerCount] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isRoomReady, setIsRoomReady] = useState(false);
  const { toast } = useToast();
  const room = useRoom(); // Access the room state
  const others = useOthers(); // Get the number of other players in the room

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
    if (!room) return; // Ensure the room context is available

    const unsubscribe = room.subscribe("others", (others) => {
      setPlayerCount(others.length + 1); // Update player count (others + self)
      console.log("Player count updated:", others.length + 1);

      // Redirect to multiplayer game page when 2 players are present
      if (others.length === 1) {
        console.log("Redirecting to game...");
        const newPath = `/play/multiplayer/${roomId}`;
        router.push(newPath);
      }
    });
    return () => unsubscribe();
  }, [room, router, roomId]);

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
  );
};

export default MultiplayerLobby;