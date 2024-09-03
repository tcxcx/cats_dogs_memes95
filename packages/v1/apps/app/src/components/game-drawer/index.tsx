import React, { useState, useEffect } from "react";
import { Button } from "@v1/ui/button";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@v1/ui/drawer";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { Alert, AlertDescription, AlertTitle } from "@v1/ui/alert";
import { Deck, GameStateLog } from "@/lib/types";
import { useAction } from "@/lib/hooks/useAction";
import { useMruInfo } from "@/lib/hooks/useMruInfo";

interface GameDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAction: 'initializeGame' | 'playTurn' | 'checkGameOver' | 'determineWinner' | null;
  gameState: GameStateLog | null;
  deck1: Deck;
  deck2: Deck;
  playerScore: number;
  opponentScore: number;
  turnCount: number;
  handIndexP1?: number;
  powIndexP1?: number;
  handIndexP2?: number;
  powIndexP2?: number;
}

export default function GameDrawer({
  isOpen,
  onClose,
  currentAction,
  gameState,
  deck1,
  deck2,
  playerScore,
  opponentScore,
  turnCount,
  handIndexP1,
  powIndexP1,
  handIndexP2,
  powIndexP2
}: GameDrawerProps) {
  const { isLoggedIn } = useWeb3Auth();
  const { submit } = useAction();
  const { mruInfo, isLoading: isMruInfoLoading } = useMruInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && currentAction && !isMruInfoLoading && mruInfo) {
      handleGameAction();
    }
  }, [isOpen, currentAction, isMruInfoLoading, mruInfo]);

  const handleGameAction = async () => {
    setIsLoading(true);
    setError(null);
    setActionResult(null);

    try {
      let result;
      switch (currentAction) {
        case 'initializeGame':
          result = await submit(currentAction, { deckP1: deck1, deckP2: deck2 });
          break;
        case 'playTurn':
          if (handIndexP1 === undefined || powIndexP1 === undefined || handIndexP2 === undefined || powIndexP2 === undefined) {
            throw new Error("Missing required parameters for playTurn");
          }
          result = await submit(currentAction, { handIndexP1, powIndexP1, handIndexP2, powIndexP2 });
          break;
        case 'checkGameOver':
          result = await submit(currentAction, {});
          break;
        case 'determineWinner':
          result = await submit(currentAction, { playerScore, opponentScore, turnCount });
          break;
        default:
          throw new Error("Invalid action");
      }
      setActionResult(result);
    } catch (error) {
      console.error(`Error during ${currentAction}:`, error);
      setError(`Failed to ${currentAction}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Game Action</DrawerTitle>
          <DrawerDescription>
            {currentAction ? `Executing: ${currentAction}` : "Preparing action..."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          {isLoggedIn ? (
            <div className="space-y-4">
              {isLoading ? (
                <Alert>
                  <AlertTitle>Processing Game Action</AlertTitle>
                  <AlertDescription>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait while we process your game action...
                  </AlertDescription>
                </Alert>
              ) : actionResult ? (
                <Alert>
                  <AlertTitle>Game Action Successful</AlertTitle>
                  <AlertDescription>
                    Action completed successfully. Hash: {actionResult.ackHash}
                  </AlertDescription>
                </Alert>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          ) : (
            <Alert>
              <AlertTitle>Not Connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to use this feature.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="noShadow">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}