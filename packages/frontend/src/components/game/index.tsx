"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSingle } from "@/components/cards/card";
import { Button } from "@/components/ui/button";
import { CardData, Power } from "@/lib/types";
import { userCards } from "@/lib/mock-cards";
import { Cat, Dog, Smile } from "lucide-react";
import {
  DynamicContainer,
  DynamicIsland,
  DynamicIslandProvider,
  DynamicTitle,
  useDynamicIslandSize,
} from "@/components/ui/dynamic-island";

type Player = "player" | "opponent";
type GamePhase = "draw" | "prep" | "combat" | "end";
type CardType = "CAT" | "DOG" | "MEME";

export default function Component() {
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [opponentHand, setOpponentHand] = useState<CardData[]>([]);
  const [playerActiveCard, setPlayerActiveCard] = useState<CardData | null>(
    null
  );
  const [opponentActiveCard, setOpponentActiveCard] = useState<CardData | null>(
    null
  );
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedPower, setSelectedPower] = useState<Power | null>(null);
  const [opponentSelectedPower, setOpponentSelectedPower] =
    useState<Power | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("draw");
  const [currentTurn, setCurrentTurn] = useState<Player>("player");
  const [winner, setWinner] = useState<Player | null>(null);

  const { state: blobState, setSize } = useDynamicIslandSize();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledDeck = [...userCards].sort(() => Math.random() - 0.5);
    setPlayerHand(shuffledDeck.slice(0, 2));
    setOpponentHand(shuffledDeck.slice(2, 4));
    setGamePhase("draw");
    setCurrentTurn("player");
    setPlayerScore(0);
    setOpponentScore(0);
    setWinner(null);
    setSize("compact");
  };

  const drawCard = (player: Player) => {
    const newCard = userCards[Math.floor(Math.random() * userCards.length)];
    if (player === "player") {
      setPlayerHand((prev) => [...prev, newCard]);
    } else {
      setOpponentHand((prev) => [...prev, newCard]);
    }
    setSize("large");
    setTimeout(() => setSize("compact"), 1500);
  };

  const playCard = (card: CardData, player: Player) => {
    if (player === "player") {
      setPlayerActiveCard(card);
      setPlayerHand((prev) => prev.filter((c) => c !== card));
    } else {
      setOpponentActiveCard(card);
      setOpponentHand((prev) => prev.filter((c) => c !== card));
    }
    setSize("medium");
    setTimeout(() => setSize("compact"), 1000);
  };

  const selectPower = (power: Power, player: Player) => {
    if (player === "player") {
      setSelectedPower(power);
    } else {
      setOpponentSelectedPower(power);
    }
  };

  const calculateTypeAdvantage = (
    playerType: CardType,
    opponentType: CardType
  ) => {
    if (
      (playerType === "CAT" && opponentType === "MEME") ||
      (playerType === "MEME" && opponentType === "DOG") ||
      (playerType === "DOG" && opponentType === "CAT")
    ) {
      return 8;
    }
    return 0;
  };

  const calculateCombatAdvantage = (
    playerPower: Power,
    opponentPower: Power
  ) => {
    if (
      (playerPower.type === "Attack" && opponentPower.type === "HP") ||
      (playerPower.type === "HP" && opponentPower.type === "Speed") ||
      (playerPower.type === "Speed" && opponentPower.type === "Attack")
    ) {
      return 4;
    }
    return 0;
  };

  const resolveCombat = () => {
    if (
      playerActiveCard &&
      opponentActiveCard &&
      selectedPower &&
      opponentSelectedPower
    ) {
      let playerValue = selectedPower.value;
      let opponentValue = opponentSelectedPower.value;

      playerValue += calculateTypeAdvantage(
        playerActiveCard.type as CardType,
        opponentActiveCard.type as CardType
      );
      opponentValue += calculateTypeAdvantage(
        opponentActiveCard.type as CardType,
        playerActiveCard.type as CardType
      );

      playerValue += calculateCombatAdvantage(
        selectedPower,
        opponentSelectedPower
      );
      opponentValue += calculateCombatAdvantage(
        opponentSelectedPower,
        selectedPower
      );

      if (playerValue > opponentValue) {
        setPlayerScore((prev) => prev + 1);
        setSize("tall");
      } else if (opponentValue > playerValue) {
        setOpponentScore((prev) => prev + 1);
        setSize("tall");
      } else {
        setSize("medium");
      }

      setTimeout(() => setSize("compact"), 2000);

      if (
        playerScore >= 4 ||
        opponentScore >= 4 ||
        playerHand.length === 0 ||
        opponentHand.length === 0
      ) {
        setWinner(playerScore >= 4 ? "player" : "opponent");
      }
    }
  };

  const nextPhase = () => {
    switch (gamePhase) {
      case "draw":
        drawCard("player");
        drawCard("opponent");
        setGamePhase("prep");
        break;
      case "prep":
        if (!playerActiveCard) {
          const randomCard =
            playerHand[Math.floor(Math.random() * playerHand.length)];
          playCard(randomCard, "player");
        }
        if (!opponentActiveCard) {
          const randomCard =
            opponentHand[Math.floor(Math.random() * opponentHand.length)];
          playCard(randomCard, "opponent");
        }
        if (!selectedPower && playerActiveCard) {
          const randomPower =
            playerActiveCard.powers[
              Math.floor(Math.random() * playerActiveCard.powers.length)
            ];
          selectPower(randomPower, "player");
        }
        if (!opponentSelectedPower && opponentActiveCard) {
          const randomPower =
            opponentActiveCard.powers[
              Math.floor(Math.random() * opponentActiveCard.powers.length)
            ];
          selectPower(randomPower, "opponent");
        }
        setGamePhase("combat");
        break;
      case "combat":
        resolveCombat();
        setGamePhase("end");
        break;
      case "end":
        setPlayerActiveCard(null);
        setOpponentActiveCard(null);
        setSelectedPower(null);
        setOpponentSelectedPower(null);
        setGamePhase("draw");
        setCurrentTurn(currentTurn === "player" ? "opponent" : "player");
        break;
    }
  };

  const getTypeIcon = (type: CardType) => {
    switch (type) {
      case "CAT":
        return <Cat className="w-6 h-6" />;
      case "DOG":
        return <Dog className="w-6 h-6" />;
      case "MEME":
        return <Smile className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const renderDynamicIslandState = () => {
    switch (blobState.size) {
      case "large":
        return (
          <DynamicContainer className="flex items-center justify-center h-full w-full">
            <DynamicTitle className="text-2xl font-black tracking-tighter text-white">
              Drawing Cards...
            </DynamicTitle>
          </DynamicContainer>
        );
      case "medium":
        return (
          <DynamicContainer className="flex items-center justify-center h-full w-full">
            <DynamicTitle className="text-2xl font-black tracking-tighter text-white">
              {gamePhase === "prep"
                ? "Preparing for Battle"
                : gamePhase === "combat"
                ? "Combat!"
                : "It's a Draw!"}
            </DynamicTitle>
          </DynamicContainer>
        );
      case "tall":
        return (
          <DynamicContainer className="flex items-center justify-center h-full w-full">
            <DynamicTitle className="text-2xl font-black tracking-tighter text-white">
              {playerScore > opponentScore
                ? "You Win This Round!"
                : "Opponent Wins This Round!"}
            </DynamicTitle>
          </DynamicContainer>
        );
      default:
        return (
          <DynamicContainer className="flex items-center justify-center h-full w-full">
            <DynamicTitle className="text-lg font-black tracking-tighter text-white">
              {winner
                ? winner === "player"
                  ? "You Win the Game!"
                  : "Opponent Wins the Game!"
                : `Current Turn: ${
                    currentTurn === "player" ? "Your Turn" : "Opponent's Turn"
                  }`}
            </DynamicTitle>
          </DynamicContainer>
        );
    }
  };

  return (
    <DynamicIslandProvider initialSize="compact">
      <div className="container mx-auto p-4 bg-gradient-to-b from-orange-100 to-orange-200 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between mb-4"
        >
          <div className="text-2xl font-bold">Player Score: {playerScore}</div>
          <div className="text-2xl font-bold">
            Opponent Score: {opponentScore}
          </div>
        </motion.div>

        <div className="text-center mb-4 text-xl font-semibold">
          {`Current Turn: ${
            currentTurn === "player" ? "Your Turn" : "Opponent's Turn"
          }`}
        </div>

        <div className="relative w-full aspect-[16/9] bg-orange-300 rounded-3xl p-8 shadow-2xl">
          {/* Opponent's Hand */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
            <AnimatePresence>
              {opponentHand.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-24 bg-red-400 rounded-lg shadow-md flex items-center justify-center"
                >
                  {getTypeIcon(card.type as CardType)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Opponent's Deck */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 w-16 h-24 bg-red-500 rounded-lg shadow-md flex items-center justify-center text-white font-bold"
          >
            Deck
          </motion.div>

          {/* Playing Field */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-around w-80 h-48 bg-orange-400 rounded-xl p-4">
            <AnimatePresence>
              {opponentActiveCard && (
                <motion.div
                  key="opponent-active"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.5 }}
                  className="transform scale-75 bg-red-200 rounded-lg p-2 shadow-md"
                >
                  <div className="text-center text-xs font-semibold text-red-700 mb-1">
                    Opponent's Card
                  </div>
                  <CardSingle card={opponentActiveCard} />
                  {opponentSelectedPower && (
                    <div className="mt-2 text-center font-bold">
                      {opponentSelectedPower.type}:{" "}
                      {opponentSelectedPower.value}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {playerActiveCard && (
                <motion.div
                  key="player-active"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                  className="transform scale-75 bg-blue-200 rounded-lg p-2 shadow-md"
                >
                  <div className="text-center text-xs font-semibold text-blue-700 mb-1">
                    Your Card
                  </div>
                  <CardSingle card={playerActiveCard} />
                  {selectedPower && (
                    <div className="mt-2 text-center font-bold">
                      {selectedPower.type}: {selectedPower.value}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Next Phase Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2"
          >
            <Button
              onClick={nextPhase}
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-2 px-4 rounded-full shadow-md"
            >
              {gamePhase === "draw"
                ? "Draw"
                : gamePhase === "prep"
                ? "Prepare"
                : gamePhase === "combat"
                ? "Combat"
                : "Next Turn"}
            </Button>
          </motion.div>

          {/* Player's Deck */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-4 left-4 w-16 h-24 bg-blue-500 rounded-lg shadow-md flex items-center justify-center text-white font-bold"
          >
            Deck
          </motion.div>

          {/* Player's Hand */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
            <AnimatePresence>
              {playerHand.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    gamePhase === "prep" && playCard(card, "player")
                  }
                  className="transform scale-75 cursor-pointer"
                >
                  <CardSingle card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {playerActiveCard && gamePhase === "prep" && !selectedPower && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <h2 className="text-lg font-bold mb-2">Select Power</h2>
              <div className="flex justify-center space-x-2">
                {playerActiveCard.powers.map((power, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => selectPower(power, "player")}
                      variant="default"
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      {power.type}: {power.value}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white p-8 rounded-xl text-center">
              <h2 className="text-3xl font-bold mb-4">
                {winner === "player"
                  ? "You Win the Game!"
                  : "Opponent Wins the Game!"}
              </h2>
              <Button
                onClick={initializeGame}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Play Again
              </Button>
            </div>
          </motion.div>
        )}

        <DynamicIsland id="game-status">
          {renderDynamicIslandState()}
        </DynamicIsland>
      </div>
    </DynamicIslandProvider>
  );
}
