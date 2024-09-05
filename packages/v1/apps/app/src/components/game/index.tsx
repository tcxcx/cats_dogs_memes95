"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardGame } from "@/components/cards/card-game";
import { Button } from "@v1/ui/button";
import {
  initializeGame,
  shuffleDeck,
  calculateTypeAdvantage,
  calculateCombatAdvantage,
  resolveCombat,
  finalizeGame,
  updateGameLog,
  drawInitialHand,
} from "@/lib/actions/game.actions";
import {
  CardData,
  Power,
  Type,
  GameState,
  Deck,
  GameLog,
  Player,
  GamePhase,
  Winner,
  GameStateLog,
} from "@/lib/types";
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
import { useAction } from "@/lib/hooks/useAction";
import { log } from "console";
import { useDynamicIsland } from "@/lib/hooks/useDynamicIsland";
// import { useXMTP } from "@/lib/hooks/useXMTP";

const Deck1: Deck = shuffleDeck([...userCards]).slice(0, 10).map((card) => card.name); //Change ...userCards to avatar cards
//console.log("First P1 Shuffle: ",Deck1);
const Deck2: Deck = shuffleDeck([...userCards]).slice(0, 10).map((card) => card.name); //Change ...userCards to avatar cards
//console.log("First P2 Shuffle: ",Deck2);
//type CardType = "CAT" | "DOG" | "MEME";

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameLog, setGameLog] = useState<GameLog | null>(null);
  const [playerMove, setPlayerMove] = useState<{
    cardIndexP1: number;
    powerIndexP1: number;
    cardIndexP2?: number;
    powerIndexP2?: number;
  } | null>(null);

  const [playerDeck, setPlayerDeck] = useState<string[]>(Deck1);
  const [opponentDeck, setOpponentDeck] = useState<string[]>(Deck2);
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [opponentHand, setOpponentHand] = useState<CardData[]>([]);
  const [playerActiveCard, setPlayerActiveCard] = useState<CardData | null>(
    null
  );
  const [opponentActiveCard, setOpponentActiveCard] = useState<CardData | null>(
    null
  );
  const [turnCount, setTurnCount] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedPower, setSelectedPower] = useState<Power | null>(null);
  const [opponentSelectedPower, setOpponentSelectedPower] =
    useState<Power | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("draw");
  const [winner, setWinner] = useState<Winner>(null);

  const { state: blobState, setSize } = useDynamicIslandSize();
  const { submit } = useAction();
  const [isGameDrawerOpen, setIsGameDrawerOpen] = useState(false);
  const [currentGameAction, setCurrentGameAction] = useState<'initializeGame' | 'playTurn' | 'checkGameOver' | 'determineWinner' | null>(null);
  const { message, isVisible, showMessage } = useDynamicIsland();

  // const { receivedAction } = useXMTP();
  const [localHandP1, setLocalHandP1] = useState<CardData[]>([]);
  const [localHandP2, setLocalHandP2] = useState<CardData[]>([]);
  const [handIndexP1, setHandIndexP1] = useState<number>(0);
  const [handIndexP2, setHandIndexP2] = useState<number>(0);
  const [powIndexP1, setPowIndexP1] = useState<number>(0);
  const [powIndexP2, setPowIndexP2] = useState<number>(0);

  // Fetch the initial game state when the component mounts
  useEffect(() => {
    async function fetchInitialGameState() {
      try {
        setPlayerDeck(Deck1);
        setOpponentDeck(Deck2);
        const initialGameState = await initializeGame(playerDeck, opponentDeck);
        setCurrentGameAction('initializeGame');
        
        const initialGameLog = {
          initialDecks: {
            deckP1: initialGameState.deckP1,
            deckP2: initialGameState.deckP2,
          },
          turns: [],
          winner: null,
        };
        setGameState(initialGameState);
        setPlayerHand(drawInitialHand(Deck1));
        setOpponentHand(drawInitialHand(Deck2));
        setGameLog(initialGameLog);
        setGamePhase("draw");
        setTurnCount(1);        

      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    }
    fetchInitialGameState();
  }, []);

  useEffect(() => {
    if (gameLog !== null) {
      try {
        if (Deck1.length > 0 && Deck2.length > 0) {
          console.log(gameLog);
        } else {
          throw new Error("Card decks are not available.");
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    } else {
      const deckP1str  = JSON.stringify(Deck1)
      const deckP2str  = JSON.stringify(Deck2)
      
      async function trySubmit() {
        await submit('initializeGame', {
          deckP1: deckP1str,
          deckP2: deckP2str,
        });
        console.log("Decks being sent to submit:", { deckP1: Deck1, deckP2: Deck2 });
      }
    trySubmit();
    }
  }, [gameLog]);

  // New handler for initializing game on button click
  const initializeGameHandler = async () => {
    try {
      setPlayerDeck(Deck1);
      setOpponentDeck(Deck2);
      const initialGameState = await initializeGame(playerDeck, opponentDeck);
      const initialGameLog = {
        initialDecks: {
          deckP1: initialGameState.deckP1,
          deckP2: initialGameState.deckP2,
        },
        turns: [],
        winner: null,
      };
      console.log("Gamestate deck1: " , initialGameState.deckP1);
      setGameState(initialGameState); // Reset the game state
      setPlayerHand(initialGameState.handP1); // Reset the player hand
      setOpponentHand(initialGameState.handP2); // Reset the opponent hand
      setWinner(null); // Reset the winner to null
      setPlayerActiveCard(null);
      setOpponentActiveCard(null);
      setSelectedPower(null);
      setOpponentSelectedPower(null);
      setPlayerScore(0);
      setOpponentScore(0);
      setTurnCount(1);
      setGameLog(initialGameLog);
      setGamePhase("draw");
      console.log("Game reset: ", gameLog, "Turn: ", turnCount);
   // Submit the initialize game action to the rollup server
      await submit('initializeGame', {
        deckP1: playerDeck ,
        deckP2: opponentDeck,
      });
      console.log("This is the deck 1", Deck1)
      console.log("This is the deck 2", Deck2)

      console.log("Game reset: ", gameLog, "Turn: ", turnCount);
    } catch (error) {
      console.error("Failed to initialize game:", error);
    }
  };

  const drawCard = (player: Player, deck: string[], turnNumber: number) => {
    const newCardName = deck[(turnNumber + 1) % deck.length];
    const newCard = userCards.find(card => card.name === newCardName);
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
    const removeOneCard = (hand: CardData[]) => {
      const index = hand.findIndex((c) => c === card);
      if (index !== -1) {
        return [...hand.slice(0, index), ...hand.slice(index + 1)];
      }
      return hand;
    };

    if (player === "player") {
      setHandIndexP1(playerHand.indexOf(card));
      setPlayerActiveCard(card);
      setPlayerHand((prev) => removeOneCard(prev));
    } else {
      setHandIndexP2(opponentHand.indexOf(card));
      setOpponentActiveCard(card);
      setOpponentHand((prev) => removeOneCard(prev));
    }

    setSize("medium");
    setTimeout(() => setSize("compact"), 1000);
  };

  const selectPower = (power: Power, player: Player) => {
    if (player === "player") {
      setSelectedPower(power);
      if (playerActiveCard) {
        setPowIndexP1(playerActiveCard.powers.indexOf(power));
      }
    } else {
      setOpponentSelectedPower(power);
      if (opponentActiveCard) {
        setPowIndexP2(opponentActiveCard.powers.indexOf(power));
      }
    }
  };

  const opponentPlay = () => {
    // Opponent selects a card and a power if not already selected
    if (!opponentActiveCard) {
      const randomCard = opponentHand[Math.floor(Math.random() * opponentHand.length)];
      if (randomCard) {
        playCard(randomCard, "opponent");
        if (!opponentSelectedPower) {
          const randomPower = randomCard.powers[Math.floor(Math.random() * randomCard.powers.length)];
          if (randomPower) {
            selectPower(randomPower, "opponent");
          }
        }
      }
    }
  };

  const resolveCombatHandler = () => {
    setSize("medium");
    if (
      playerActiveCard &&
      opponentActiveCard &&
      selectedPower &&
      opponentSelectedPower
    ) {
      const { newPlayerScore, newOpponentScore, size } = resolveCombat(
        playerActiveCard,
        opponentActiveCard,
        selectedPower,
        opponentSelectedPower,
        playerScore,
        opponentScore,
        calculateTypeAdvantage,
        calculateCombatAdvantage
      );
      setPlayerScore(newPlayerScore);
      setOpponentScore(newOpponentScore);
      setSize(size);

      setTimeout(() => setSize("compact"), 2000);
      //Winner declaration
      const { winner, updatedGameLog } = finalizeGame(
        playerScore,
        opponentScore,
        turnCount,
        gameLog!
      );
      setGameLog(updatedGameLog);
      setWinner(winner);
    }
  };


    const nextPhase = async () => {
    const { winner, updatedGameLog } = finalizeGame(
      playerScore,
      opponentScore,
      turnCount,
      gameLog!
    );

    setGameLog(updatedGameLog);
    setWinner(winner);

    if (winner ||  turnCount >= 8) {
      try {
        await submit("finalizeGame", {
          playerScore,
          opponentScore,
          turnCount,
          gameLog: JSON.stringify(updatedGameLog),
        });
        console.log("Finalized game log and winner submitted successfully.");
      } catch (error) {
        console.error("Failed to submit finalized game log and winner:", error);
      }
    }

    
    switch (gamePhase) {
      case "draw":
        drawCard("player", playerDeck, turnCount);
        drawCard("opponent", opponentDeck, turnCount);
   
        setGamePhase("prep");
        break;
      case "prep":
        setLocalHandP1(playerHand)
        setLocalHandP2(opponentHand)
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
        resolveCombatHandler();
        setGamePhase("check");
        break;
      case "check":
        setTurnCount((prevCount) => prevCount + 1);

        // const powIndexP1 = playerActiveCard!.powers.indexOf(selectedPower!);
        // const powIndexP2 = opponentActiveCard!.powers.indexOf(opponentSelectedPower!);

        // Check that all indices are valid before proceeding
        console.log(handIndexP1, powIndexP1, handIndexP2, powIndexP2);
        if (handIndexP1 === -1 || powIndexP1 === -1 || handIndexP2 === -1 || powIndexP2 === -1) {
          console.error("Invalid card or power selection: cannot find indices.");
          return;
        }      

      //  await submit('playTurn', {

      //   handIndexP1: handIndexP1,
      //   powIndexP1: powIndexP1,
      //   handIndexP2:handIndexP2,
      //   powIndexP2: powIndexP2,
      // });

        await submit('playTurn', {
          playerActiveCard: JSON.stringify(playerActiveCard),
          opponentActiveCard: JSON.stringify(opponentActiveCard),
          selectedPower: JSON.stringify(selectedPower),
          opponentSelectedPower: JSON.stringify(opponentSelectedPower),
        });
      

        const updatedGameLog = updateGameLog(
          gameLog!,
          turnCount,
          playerActiveCard!,
          opponentActiveCard!,
          selectedPower!,
          opponentSelectedPower!,
          [playerScore, opponentScore]
        );
        setGameLog(updatedGameLog);
        setPlayerActiveCard(null);
        setOpponentActiveCard(null);
        setSelectedPower(null);
        setOpponentSelectedPower(null);
        setGamePhase("draw");
  
      // Submit the playTurn action to the rollup server

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
    // if (receivedAction) {
    //   return (
    //     <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
    //       <DynamicTitle className="text-2xl font-departure tracking-tighter text-white">
    //         {`Received action: ${receivedAction.action}`}
    //       </DynamicTitle>
    //     </DynamicContainer>
    //   );
    // }

  switch (gamePhase) {
    case "draw":
      return (
        <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
          <DynamicTitle className="text-4xl font-departure tracking-tighter text-white">
            Drawing Cards...
          </DynamicTitle>
        </DynamicContainer>
      );
    case "prep":
      return (
        <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
          <DynamicTitle className="text-4xl font-departure tracking-tighter text-white">
            Preparing for Battle
          </DynamicTitle>
        </DynamicContainer>
      );
    case "combat":
      return (
        <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
          <DynamicTitle className="text-4xl font-departure tracking-tighter text-white">
            Combat!
          </DynamicTitle>
        </DynamicContainer>
      );
    case "check":
      return (
        <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
          <DynamicTitle className="text-4xl font-departure tracking-tighter text-white">
            {playerScore > opponentScore
              ? "You Win This Round!"
              : playerScore < opponentScore
              ? "Opponent Wins This Round!"
              : "It's a Draw!"}
          </DynamicTitle>
        </DynamicContainer>
      );
    default:
      return (
        <DynamicContainer className="flex-shrink items-center justify-center h-2 w-full">
          <DynamicTitle className="text-4xl font-departure tracking-tighter text-white">
            {turnCount >= 8
              ? winner
                ? winner === "player"
                  ? "You Win the Game!"
                  : "Opponent Wins the Game!"
                : "Waiting..."
              : "It's a Draw!"}
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
            <div className="text-3xl text-center font-departure">
              {" "}
              Player{"\n"}
              {playerScore}{" "}
            </div>
            <div className="flex max-h-12 overflow-visible">
              <DynamicIsland id="game-status">
                {renderDynamicIslandState()}
              </DynamicIsland>
            </div>
            <div className="text-3xl text-center font-departure">
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
                    <div className="text-center text-xs font-departure text-red-700 mb-1">
                      Opponent`s Card
                    </div>
                    <CardGame card={opponentActiveCard} />
                    {opponentSelectedPower && (
                      <div className="mt-2 text-center font-departure">
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
                    <div className="text-center text-xs font-departure text-blue-700 mb-1">
                      Your Card
                    </div>
                    <CardGame card={playerActiveCard} />
                    {selectedPower && (
                      <div className="mt-2 text-center font-departure">
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
              className="relative h-1/5 aspect-[3/4] bg-red-400 rounded-lg shadow-md flex items-center justify-center text-center font-departure shadow-stone-900"
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
              className="relative h-1/5 aspect-[3/4] bg-blue-400 rounded-lg shadow-md flex items-center justify-center text-center font-departure shadow-stone-900"
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
                className="bg-yellow-400 text-black hover:bg-yellow-200 font-departure px-4 rounded-full shadow-md"
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
                <h2 className="text-2xl font-departure mb-4">Powers</h2>
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
                <h2 className="text-3xl font-departure mb-4">
                  {winner === "player"
                    ? "You Win the Game!"
                    : "Opponent Wins the Game!"}
                </h2>
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={initializeGameHandler /*Reset Game or send contract to reset game*/}
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