"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardGame } from "@/components/cards/card-game";
import { Button } from "@v1/ui/button";
import {
  initializeGame,
  playTurn,
  fetchGameState,
  determineWinner,
} from "@/lib/actions/game.actions";
import { CardData, Power, Type, GameState, Deck, GameLog } from "@/lib/types";
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

type Player = "player" | "opponent";
type GamePhase = "draw" | "prep" | "combat" | "check";
//type CardType = "CAT" | "DOG" | "MEME";

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerMove, setPlayerMove] = useState<{
    cardIndexP1: number;
    powerIndexP1: number;
    cardIndexP2?: number;
    powerIndexP2?: number;
  } | null>(null);

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
  const [winner, setWinner] = useState<Player | null>(null);

  const { state: blobState, setSize } = useDynamicIslandSize();

  // Shuffle Functions
  function shuffleDeck(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }
  // Mock deck for demonstration purposes Assuming userCards is of type CardData[]
  const Deck1: Deck = shuffleDeck([...userCards])
    .slice(0, 10)
    .map((card) => card.name); // Or use card.id if Deck should contain IDs

  const Deck2: Deck = shuffleDeck([...userCards])
    .slice(0, 10)
    .map((card) => card.name); // Or use card.id if Deck should contain IDs

  useEffect(() => {
    // Fetch the initial game state when the component mounts
    async function fetchInitialGameState() {
      try {
        const initialGameState = await initializeGame(Deck1, Deck2);
        setGameState(initialGameState); // Set the game state from the backend response
        setPlayerHand(initialGameState.handP1); // Set the player's hand from the backend response
        setOpponentHand(initialGameState.handP2); // Set the opponent's hand from the backend response
      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    }
    fetchInitialGameState();
  }, []);

  // New handler for initializing game on button click
  const initializeGameHandler = async () => {
    try {
      const initialGameState = await initializeGame(Deck1, Deck2);
      setGameState(initialGameState); // Reset the game state
      setPlayerHand(initialGameState.handP1); // Reset the player hand
      setOpponentHand(initialGameState.handP2); // Reset the opponent hand
      setWinner(null); // Reset the winner to null
      setPlayerActiveCard(null);
      setOpponentActiveCard(null);
      setSelectedPower(null);
      setOpponentSelectedPower(null);
      setGamePhase("draw");
      setPlayerScore(0);
      setOpponentScore(0);
    } catch (error) {
      console.error("Failed to initialize game:", error);
    }
  };

  // Play Turn Function Handler
  const handlePlayTurn = async () => {
    if (playerMove && gameState) {
      // Ensure Player 2 makes a random choice if none is selected
      const cardIndexP2 =
        playerMove.cardIndexP2 ??
        Math.floor(Math.random() * gameState.handP2.length);
      const powerIndexP2 =
        playerMove.powerIndexP2 ??
        Math.floor(Math.random() * gameState.powerList.length);

      try {
        const result = await playTurn(
          gameState,
          playerMove.cardIndexP1,
          playerMove.powerIndexP1,
          cardIndexP2,
          powerIndexP2,
          gameState.typeList,
          gameState.powerList
        );
        setGameState(result); // Update the game state after the turn is played
      } catch (error) {
        console.error("Failed to play turn:", error);
      }
    }
  };

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

  const chooseCard = (player: "P1" | "P2", index: number) => {
    setPlayerMove((prevMove) => {
      // Ensure prevMove is not null and has the necessary structure
      if (!prevMove) {
        return player === "P1"
          ? { cardIndexP1: index, powerIndexP1: 0 } // Initialize P1 values
          : { cardIndexP1: 0, powerIndexP1: 0, cardIndexP2: index }; // Initialize P2 values
      }
      return {
        ...prevMove,
        cardIndexP1: player === "P1" ? index : prevMove.cardIndexP1,
        cardIndexP2: player === "P2" ? index : prevMove.cardIndexP2,
      };
    });
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

  const choosePower = (player: "P1" | "P2", index: number) => {
    setPlayerMove((prevMove) => {
      // Ensure prevMove is not null and has the necessary structure
      if (!prevMove) {
        return player === "P1"
          ? { cardIndexP1: 0, powerIndexP1: index } // Initialize P1 values
          : { cardIndexP1: 0, powerIndexP1: 0, powerIndexP2: index }; // Initialize P2 values
      }
      return {
        ...prevMove,
        powerIndexP1: player === "P1" ? index : prevMove.powerIndexP1,
        powerIndexP2: player === "P2" ? index : prevMove.powerIndexP2,
      };
    });
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
        opponentScore >= 4
        //  playerHand.length === 0 ||
        //  opponentHand.length === 0
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
        setGamePhase("check");
        break;
      case "check":
        setPlayerActiveCard(null);
        setOpponentActiveCard(null);
        setSelectedPower(null);
        setOpponentSelectedPower(null);
        setGamePhase("draw");
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
          <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
            <DynamicTitle className="text-4xl font-black tracking-tighter text-white">
              Drawing Cards...
            </DynamicTitle>
          </DynamicContainer>
        );
      case "medium":
        return (
          <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
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
          <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
            <DynamicTitle className="text-4xl font-black tracking-tighter text-white">
              {playerScore > opponentScore
                ? "You Win This Round!"
                : "Opponent Wins This Round!"}
            </DynamicTitle>
          </DynamicContainer>
        );
      default:
        return (
          <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
            <DynamicTitle className="text-4xl font-black tracking-tighter text-white">
              {winner
                ? winner === "player"
                  ? "You Win the Game!"
                  : "Opponent Wins the Game!"
                : "Waiting..."}
            </DynamicTitle>
          </DynamicContainer>
        );
    }
  };

  return (
    <DynamicIslandProvider initialSize="medium">
      <motion.div className="flex items-start justify-center h-full">
        <div className="container p-3 bg-transparent h-fit max-w-full">
          <motion.div
            style={{
              alignSelf: "center",
              scale: 0.7,
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between mb-4 center"
          >
            {/* Scores */}
            <div className="text-3xl text-center font-bold">
              {" "}
              Player{"\n"}
              {playerScore}{" "}
            </div>
            <div className="flex max-h-12 overflow-visible">
              <DynamicIsland id="game-status">
                {renderDynamicIslandState()}
              </DynamicIsland>
            </div>
            <div className="text-3xl text-center font-bold">
              {" "}
              Opponent{"\n"}
              {opponentScore}{" "}
            </div>
          </motion.div>

          <motion.div
            style={{
              backgroundImage: "url(/BoardBG.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="relative h-fit aspect-[6/5] bg-pink-300 bg-opacity-90 rounded-2xl p-8 shadow-2xl"
          >
            {/* Playing Field */}
            <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-around w-1/2 h-3/5 bg-orange-400 bg-opacity-30 rounded-xl p-4 shadow-md">
              {/*Opponent Active CArd */}
              <AnimatePresence>
                {opponentActiveCard && (
                  <motion.div
                    style={{
                      alignSelf: "center",
                    }}
                    key="opponent-active"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5 }}
                    className="transform scale-75 bg-red-100 bg-opacity-50 rounded-lg p-2 shadow-md center w-1/2 h-4/5"
                  >
                    <div className="text-center text-xs font-semibold text-red-700 mb-1">
                      Opponent`s Card
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
              {/*Divider*/}
              <div className="w-full max-w-6 h-fit bg-transparent my-2 flex-grow"></div>
              {/*Player Active Card*/}
              <AnimatePresence>
                {playerActiveCard && (
                  <motion.div
                    style={{
                      alignSelf: "center",
                      scale: 1,
                    }}
                    key="player-active"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.5 }}
                    className="transform scale-75 bg-blue-100 bg-opacity-50 rounded-lg p-2 shadow-sm w-1/2 h-4/5 justify-self-end"
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
            </div>

            {/* Opponent's Hand */}
            <div className="absolute h-1/5 top-2 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
              <AnimatePresence>
                {opponentHand.map((icon_type, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, animationDelay: "2s" }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="aspect-[3/4] bg-red-400 rounded-lg shadow-2xl flex items-center justify-center"
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
                aspectRatio: "3/4",
                backgroundImage: "url(/CardbackS1_2.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-1/5 aspect-[3/4] bg-red-400 rounded-lg shadow-md flex items-center justify-center text-center font-bold shadow-stone-900"
              initial={{ x: "350%", y: "-100%", animationDelay: "1s" }}
              animate={{ x: "50%", y: "-250%" }}
            >
              Opponent`s Deck
            </motion.div>

            {/* Player's Deck */}
            <motion.div
              style={{
                aspectRatio: "3/4",
                backgroundImage: "url(/CardbackS1_2.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-1/5 aspect-[3/4] bg-blue-400 rounded-lg shadow-md flex items-center justify-center text-pretty font-bold shadow-stone-900"
              initial={{ x: "350%", y: "-200%", animationDelay: "1s" }}
              animate={{ x: "650%", y: "-50%" }}
            >
              Deck
            </motion.div>

            {/* Player's Hand */}
            <div className="absolute h-1/4 left-1/2 transform -translate-x-1/2 -translate-y-full flex justify-center space-x-2">
              <AnimatePresence>
                {playerHand.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: "-5%",
                      animationDelay: "1.5s",
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      gamePhase === "prep" && playCard(card, "player")
                    }
                    className="aspect-[3/4] transform scale-75 flex cursor-pointer"
                  >
                    <CardGame card={card} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

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
          </motion.div>

          <AnimatePresence>
            {playerActiveCard && gamePhase === "prep" && !selectedPower && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-[40%] left-[15%] transform ml-4"
              >
                <h2 className="text-2xl font-extrabold mb-4">
                  Powers
                </h2>
                <div className="flex flex-col justify-center space-y-2">
                  {playerActiveCard.powers.map((power, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Power Buttons */}
                      <Button
                        onClick={() => selectPower(power, "player")}
                        variant="noShadow"
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
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={initializeGameHandler}
                >
                  Play Again
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </DynamicIslandProvider>
  );
}

//// DUMP
/*
  const initializeGame = () => {
    const shuffledDeck = [...userCards].sort(() => Math.random() - 0.5);
    setPlayerHand(shuffledDeck.slice(0, 2));
    setOpponentHand(shuffledDeck.slice(2, 4));
    setGamePhase("draw");
    setPlayerScore(0);
    setOpponentScore(0);
    setWinner(null);
    setSize("compact");
  };
  */
/* Play Again Button
              <Button
                onClick = {initializeGame( Deck1, Deck2)}
                className="bg-green-500 text-white hover:bg-green-600"
              
                Play Again
              </Button>
              >*/
