"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardGame } from "@/components/cards/card-game";
import { Button } from "@v1/ui/button";
import { CardData, Power, Type } from "@/lib/types";
import { userCards } from "@/lib/mock-cards";
import { Cat, Dog, Smile } from "lucide-react";
import {
  DynamicContainer,
  DynamicIsland,
  DynamicIslandProvider,
  DynamicTitle,
  useDynamicIslandSize,
} from "@v1/ui/dynamic-island";
import Image from "next/image";
import { useGesture } from "@use-gesture/react";
import MultiplayerCard from "@/components/game/multiplayer-card";

type Player = "player" | "opponent";
type GamePhase = "draw" | "prep" | "combat" | "end";
//type CardType = "CAT" | "DOG" | "MEME";

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
  const cardRef = useRef<HTMLDivElement | null>(null);

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

  const bindCardDrag = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        if (cardRef.current) {
          cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      },
    },
    {
      drag: {
        from: () => {
          if (cardRef.current) {
            const transform = cardRef.current.style.transform;
            const match = transform.match(/translate3d\((.*)px, (.*)px, 0\)/);
            if (match && match[1] !== undefined && match[2] !== undefined) {
              return [parseFloat(match[1]), parseFloat(match[2])];
            }
          }
          return [0, 0];
        },
      },
    }
  );

  const drawCard = (player: Player) => {
    const newCard = userCards[Math.floor(Math.random() * userCards.length)];
    if (!newCard) {
      console.error("Failed to draw a card: no cards available.");
      return; // Exit the function early if no card was drawn
    }
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

  const calculateTypeAdvantage = (playerType: Type, opponentType: Type) => {
    if (
      (playerType.type === "Cat" && opponentType.type === "Meme") ||
      (playerType.type === "Meme" && opponentType.type === "Dog") ||
      (playerType.type === "Dog" && opponentType.type === "Cat")
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
      (playerPower.type === "attack" && opponentPower.type === "defense") ||
      (playerPower.type === "defense" && opponentPower.type === "speed") ||
      (playerPower.type === "speed" && opponentPower.type === "attack")
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
        playerActiveCard.type as any,
        opponentActiveCard.type as any
      );
      opponentValue += calculateTypeAdvantage(
        opponentActiveCard.type as any,
        playerActiveCard.type as any
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
          if (randomCard) {
            playCard(randomCard, "player");
            if (!selectedPower) {
              const randomPower =
                randomCard.powers[
                  Math.floor(Math.random() * randomCard.powers.length)
                ];
              if (randomPower) {
                  selectPower(randomPower, "player");
              }
            }
          }
        }
        if (!opponentActiveCard) {
          const randomCard =
            opponentHand[Math.floor(Math.random() * opponentHand.length)];
          if (randomCard) {
            playCard(randomCard, "opponent");
            if (!opponentSelectedPower) {
              const randomPower =
                randomCard.powers[
                  Math.floor(Math.random() * randomCard.powers.length)
                ];
              if (randomPower) {
                selectPower(randomPower, "opponent");
              }
            }
          }
        }
        if (!selectedPower && playerActiveCard) {
          const randomPower =
            playerActiveCard.powers[
              Math.floor(Math.random() * playerActiveCard.powers.length)
            ];
          if (randomPower) {
            selectPower(randomPower, "opponent");
          }
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

  const getTypeIcon = (icon_type: Type) => {
    switch (icon_type.type) {
      case "Cat":
        return <Cat className="w-6 h-6" />;
      case "Dog":
        return <Dog className="w-6 h-6" />;
      case "Meme":
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
            <DynamicTitle className="text-4xl font-black tracking-tighter text-white">
              Drawing Cards...
            </DynamicTitle>
          </DynamicContainer>
        );
      case "medium":
        return (
          <DynamicContainer className="flex items-center justify-center h-full w-full">
            <DynamicTitle className="text-4xl font-black tracking-tighter text-white">
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
            <DynamicTitle className="text-4xl font-black tracking-tighter text-white">
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
                : `Current Phase: ${
                    currentTurn === "player" ? "Your Turn" : "Opponent's Turn"
                  }`}
            </DynamicTitle>
          </DynamicContainer>
        );
    }
  };

  return (
    <DynamicIslandProvider initialSize="default">
      <div className="container p-4 bg-transparent min-h-screen max-w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between mb-4 center"
        >
          <div className="text-4xl font-bold">
            {" "}
            Player Score: {playerScore}{" "}
          </div>
          <div className="text-4xl font-bold">
            {" "}
            Opponent Score: {opponentScore}{" "}
          </div>
        </motion.div>

        <div className="relative w-full aspect-[6/5] bg-transparent rounded-3xl p-8 shadow-xl">
          {/* Playing Field */}
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-around w-1/2 h-3/5 bg-orange-400 rounded-xl p-4 shadow-md">
            <AnimatePresence>
              {playerActiveCard && (
                <motion.div
                  style={{
                    alignSelf: "center",
                  }}
                  key="player-active"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                  className="transform scale-75 bg-blue-200 rounded-lg p-2 shadow-md center h-fit w-fit"
                >
                  <div className="text-center text-xs font-semibold text-blue-700 mb-1">
                    Your Card
                  </div>
                  <CardGame card={playerActiveCard} />
                  {selectedPower && (
                    <div className="mt-2 text-center font-bold">
                      {selectedPower.type}: {selectedPower.value}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {opponentActiveCard && (
                <motion.div
                  style={{
                    alignSelf: "center",
                  }}
                  key="opponent-active"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.5 }}
                  className="transform scale-75 bg-red-200 rounded-lg p-2 shadow-md center h-fit w-fit"
                >
                  <div className="text-center text-xs font-semibold text-red-700 mb-1">
                    Opponent's Card
                  </div>
                  <CardGame card={opponentActiveCard} />
                  {opponentSelectedPower && (
                    <div className="mt-2 text-center font-bold">
                      {opponentSelectedPower.type}:{" "}
                      {opponentSelectedPower.value}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Opponent's Hand */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
            <AnimatePresence>
              {opponentHand.map((icon_type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="w-48 h-64 bg-red-400 rounded-lg shadow-2xl flex items-center justify-center"
                >
                  {getTypeIcon(icon_type as any)}
                  <Image
                    src={"/CardbackS1_2.png"}
                    alt="Banner"
                    objectFit="cover"
                    priority
                    width={200}
                    height={300}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Opponent's Deck */}
          <motion.div
            style={{
              backgroundImage: "url(/CardbackS1_2.png",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 h-64 w-48 bg-red-500 rounded-lg shadow-md flex items-center justify-center text-pretty font-bold shadow-stone-900"
          >
            Opponent's Deck
          </motion.div>

          {/* Next Phase Button */}
          <motion.div
            whileHover={{
              translateY: -5,
              translateX: -5,
              scale: 1.05,
              rotate: 0,
            }}
            whileTap={{ translateY: -5, translateX: -5, scale: 0.95 }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2"
          >
            <Button
              onClick={nextPhase}
              className="bg-yellow-400 text-black hover:bg-yellow-200 font-bold px-4 rounded-full shadow-md"
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
            style={{
              backgroundImage: "url(/CardbackS1_2.png",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-4 left-4 h-96 aspect-[3/4] bg-blue-500 rounded-lg shadow-md flex items-center justify-center text-pretty font-bold shadow-stone-900"
          >
            Deck
          </motion.div>

          {/* Player's Hand */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
            {!playerActiveCard && (
              <AnimatePresence>
                {playerHand.map((card, index) => (
                  <MultiplayerCard
                    key={index}
                    card={card}
                    initialPos={{ x: index * 150, y: 0 }} // Example initial position
                    cardId={`playerCard-${index}`} // Unique identifier for this card
                    isBlocked={!!playerActiveCard}
                  />
                ))}
              </AnimatePresence>
            )}
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
                {/* Power Display */}
                {playerActiveCard.powers.map((power, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 1 }}
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
