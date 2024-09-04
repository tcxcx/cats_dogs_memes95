"use client";

import { FC, useRef, useState  } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import { LiveProvider } from "@/lib/liveblocks";
import { useSearchParams } from "next/navigation";

const MultiplayerLandingPage: FC = () => {
    const [sessionId, setSessionId] = useState('');
    const router = useRouter();
  
    const handleJoinSession = () => {
      if (sessionId) {
        // Navigate to the dynamic session page with the session ID
        router.push(`/play/multiplayer/${sessionId}`);
      }
    };

    return (
        <DynamicIslandProvider initialSize="compact">
          <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent">
            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-gray-800 mb-8"
            >
              Enter Multiplayer Session
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-opacity-40 bg-white rounded-lg p-6 shadow-lg max-w-md w-full"
            >
              <h2 className="text-2xl font-semibold mb-4 opacity-90">
                Join a Session
              </h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter Session ID"
                  className="w-full"
                />
                <Button
                  onClick={handleJoinSession}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Join Session
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 text-gray-700 text-center"
            >
              <p>Please enter a session ID to join a multiplayer game.</p>
            </motion.div>
          </div>
        </DynamicIslandProvider>
      );
    };
    
export default MultiplayerLandingPage;