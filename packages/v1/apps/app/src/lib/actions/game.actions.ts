import {
  CardCollection,
  Deck,
  Hand,
  GameState,
  Score,
  TurnResult,
  CardData,
  Power,
  TypeList,
  Type,
  PowerList,
  GameLog,
  Player,
  Winner,
  Size,
} from "@/lib/types"; // Assuming these types exist based on your project structure
import { userCards } from "@/lib/mock-cards";
import { SIZE_PRESETS, SizePresets } from "@v1/ui/dynamic-island";

// Shuffle Functions
export function shuffleDeck(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
export function shuffleDeckAction(deck: Deck): Deck {
  return deck.sort(() => Math.random() - 0.5);
}
const Deck1: Deck = shuffleDeckAction(
  [...userCards]
    .slice(0, 10)
    .map((card) => card.name)
    .filter((name): name is string => name !== undefined)
);
const Deck2: Deck = shuffleDeckAction(
  [...userCards]
    .slice(0, 10)
    .map((card) => card.name)
    .filter((name): name is string => name !== undefined)
);

const cardCollection: CardCollection = userCards.reduce((collection, card) => {
  if (card.name) {
    collection[card.name] = card; // Use card.name or card.id as the key, depending on your needs
  }
  return collection;
}, {} as CardCollection);

const iniHandP1: CardData[] = Deck1.map((cardName) => cardCollection[cardName])
  .filter((card): card is CardData => card !== undefined)
  .slice(0, 2);
const iniHandP2: CardData[] = Deck2.map((cardName) => cardCollection[cardName])
  .filter((card): card is CardData => card !== undefined)
  .slice(0, 2);

// Mock Game state for demonstration purposes
let currentGameState: GameState = {
  deckP1: Deck1, // Replace with actual deck initialization
  deckP2: Deck2, // Replace with actual deck initialization
  handP1: iniHandP1,
  handP2: iniHandP2,
  score: [0, 0], // Initial score
  turnCount: 0, // Start of the game
  cardCollection: cardCollection, // Your full card collection or subset as needed
  powerList: ["attack", "defense", "speed"], // Populate with Power type data
  typeList: ["Cat", "Dog", "Meme"], // Assuming these are the types
};

// Empty Game log
let gameLog: GameLog = {
  initialDecks: {
    deckP1: [],
    deckP2: [],
  },
  turns: [],
  winner: null,
};

// Function to fetch the current game state
export async function fetchGameState(
    gameState: GameState,
    gameLog: GameLog,
): Promise<GameState> {
  try {
    console.log("fetching game state");
    // Logic to retrieve the current game state
    // For this example, it's returning the mock state
    // In real scenarios, ensure this pulls from wherever you manage state (e.g., in-memory, database)
    return currentGameState;
  } catch (error) {
    console.error("Error fetching game state:", error);
    throw error; // Re-throw the error to handle it in the service or calling function
  }
}
// ========== INITIALIZE GAME FUNCTIONS ==========
export function drawInitialHand(deck: Deck): Hand {
  console.log("Deck from hand: ", deck);
  try {
    if (!deck || deck.length < 10) {
      throw new Error("Deck must contain 10 cards.");
    }
    /*if (!cardCollection) {
      throw new Error("Card collection must be non-null.");
    }*/
  }
  catch (error) {
    console.error("Error in drawInitialHand:", error);
    throw error;
  }
  const newCardName1 = deck[0 % deck.length];
  const newCardName2 = deck[1 % deck.length];
  const newCard1 = userCards.find(card => card.name === newCardName1);
  const newCard2 = userCards.find(card => card.name === newCardName2);
  return [newCard1!, newCard2!];

  //return deck.slice(0, 2).map((cardNameOrId) => cardCollection[cardNameOrId]).filter((card): card is CardData => card !== undefined);
}

export function calculateTurnOutcome(
  coll: CardCollection,
  card1: string,
  card2: string,
  pow1: Power["type"], // Now using Power type
  pow2: Power["type"],
  types: string[],
  powers: string[]
): TurnResult {
  const cardData1 = coll[card1];
  const cardData2 = coll[card2];
  if (!cardData1 || !cardData2) {
    throw new Error("One or both cards not found in the collection.");
  }
  let val1 = cardData1.powers.find((power) => power.type === pow1)?.value ?? 0;
  let val2 = cardData2.powers.find((power) => power.type === pow2)?.value ?? 0;
  const type1 = cardData1.type[0]?.type;
  const type2 = cardData2.type[0]?.type;

  if (!type1 || !type2) {
    throw new Error("One or both card types are missing..");
  }
  const type1Index = types.indexOf(type1);
  const type2Index = types.indexOf(type2);

  if (type1Index === -1 || type2Index === -1) {
    throw new Error("Type not found in the type list.");
  }

  const pow1Index = powers.indexOf(pow1);
  const pow2Index = powers.indexOf(pow2);

  // Type balancing
  if ((type1Index - type2Index) % 3 === 1) {
    val2 += 8;
  } else if ((type1Index - type2Index) % 3 === 2) {
    val1 += 8;
  }

  // Attribute balancing
  if ((pow1Index - pow2Index) % 3 === 1) {
    val2 += 4;
  } else if ((pow1Index - pow2Index) % 3 === 2) {
    val1 += 4;
  }

  return {
    player1Points: val1 > val2 ? 1 : 0,
    player2Points: val2 > val1 ? 1 : 0,
  };
}

// build Card Collection
export function buildCardCollection(cards: CardData[]): CardCollection {
  return cards.reduce((collection, card) => {
    collection[card.name] = card;
    return collection;
  }, {} as CardCollection);
}

// Game initialization
export function initializeGame(deckP1: Deck, deckP2: Deck): GameState {
  console.log("initializing game");
  const sDeckP1 = deckP1;//shuffleDeckAction(deckP1);
  const sDeckP2 = deckP2;//shuffleDeckAction(deckP2);

  const initialGameState: GameState = {
    deckP1: sDeckP1,
    deckP2: sDeckP2,
    handP1: drawInitialHand(sDeckP1),
    handP2: drawInitialHand(sDeckP2),
    score: [0, 0],
    turnCount: 0,
    cardCollection: buildCardCollection(userCards),
    powerList: ["attack", "defense", "speed"],
    typeList: ["Cat", "Dog", "Meme"],
  };

  gameLog = {
    initialDecks: {
      deckP1: sDeckP1,
      deckP2: sDeckP2,
    },
    turns: [],
    winner: null,
  };
  return initialGameState;
}

// ========== GAME LOG FUNCTIONS ==========
// Function to update the game log after each turn
export function updateGameLog(
  gameLog: GameLog,
  turnNumber: number,
  cardP1: CardData,
  cardP2: CardData,
  powerP1: Power,
  powerP2: Power,
  currentScore: Score
): GameLog {
  const updatedGameLog = {
    ...gameLog,
    turns: [
      ...gameLog.turns,
      {
        turnNumber,
        playedCards: { cardP1, cardP2, powerP1, powerP2 },
        currentScore: {
          player1Points: currentScore[0],
          player2Points: currentScore[1],
        },
      },
    ],
  };
  return updatedGameLog;
}

// ========== PLAY TURN FUNCTIONS ==========
// Play Turn Function Handler
export function playTurn(
  gameState: GameState,
  handIndexP1: number, // Index of the card in the player's hand
  powIndexP1: number, // Index of the power in the player's hand
  handIndexP2: number, // Index of the card in the opponent's hand
  powIndexP2: number, // Index of the power in the opponent's hand
  types: typeof TypeList,
  powers: typeof PowerList
): GameState {
  const { deckP1, deckP2, handP1, handP2, score, turnCount, cardCollection } =
    gameState;
  // Check if indices are within the bounds of the hands
  if (
    handIndexP1 < 0 ||
    handIndexP1 >= handP1.length ||
    handIndexP2 < 0 ||
    handIndexP2 >= handP2.length
  ) {
    throw new Error("Invalid hand index provided.");
  }

  const playerCardP1 = handP1[handIndexP1]!; // CardData object from player's hand
  const playerCardP2 = handP2[handIndexP2]!; // CardData object from opponent's hand

  const turnResult = calculateTurnOutcome(
    gameState.cardCollection,
    playerCardP1.name, // Use the name property of the CardData object
    playerCardP2.name, // Use the name property of the CardData object
    gameState.powerList[powIndexP1],
    gameState.powerList[powIndexP2],
    types,
    powers
  );

  // Update score and hands
  const updatedScore: Score = [
    score[0] + turnResult.player1Points,
    score[1] + turnResult.player2Points,
  ];

  const updatedHandP1 = handP1.filter((_, idx) => idx !== handIndexP1);
  const updatedHandP2 = handP2.filter((_, idx) => idx !== handIndexP2);

  // Draw a new card from the deck if hands are empty
  const newCardIndexP1 = (turnCount + 3) % deckP1.length;
  const newCardIndexP2 = (turnCount + 3) % deckP2.length;

  // Draw a new card from the deck if hands are empty
  const newCardP1: CardData = cardCollection[deckP1[newCardIndexP1]!]!;
  const newCardP2: CardData = cardCollection[deckP2[newCardIndexP2]!]!;

  if (!newCardP1 || !newCardP2) {
    throw new Error("A new card could not be drawn from the deck.");
  }

  // Update hands to ensure they contain only CardData objects
  const finalHandP1: CardData[] = updatedHandP1.length
    ? updatedHandP1
    : [...updatedHandP1, newCardP1!].filter((card) => card !== undefined);
  const finalHandP2: CardData[] = updatedHandP2.length
    ? updatedHandP2
    : [...updatedHandP2, newCardP2!].filter((card) => card !== undefined);

  updateGameLog(
    gameLog,
    turnCount + 1,
    playerCardP1,
    playerCardP2,
    gameState.powerList[powIndexP1],
    gameState.powerList[powIndexP2],
    updatedScore
  );
  console.log(turnCount);

  return {
    ...gameState,
    score: updatedScore,
    handP1: finalHandP1,
    handP2: finalHandP2,
    turnCount: turnCount + 1,
  };
}
// Play Turn Function Handler
export async function playTurnHandler(
  gameState: GameState,
  handIndexP1: number, // Index of the card in the player's hand
  powIndexP1: number, // Index of the power in the player's hand
  handIndexP2: number, // Index of the card in the opponent's hand
  powIndexP2: number // Index of the power in the opponent's hand
): Promise<GameState> {
  const selCardIndexP1 = handIndexP1;
  const selPowerIndexP1 = powIndexP1;
  const selCardIndexP2 =
    handIndexP2 ?? Math.floor(Math.random() * gameState.handP2.length);
  const selPowerIndexP2 =
    powIndexP2 ?? Math.floor(Math.random() * gameState.powerList.length);

  try {
    const result = await playTurn(
      gameState,
      selCardIndexP1,
      selPowerIndexP1,
      selCardIndexP2,
      selPowerIndexP2,
      gameState.typeList,
      gameState.powerList
    );
    return result; // Update the game state after the turn is played
  } catch (error) {
    console.error("Failed to play turn:", error);
    throw error;
  }
}
// Resolve combat
export function resolveCombat(
    playerActiveCard: CardData,
    opponentActiveCard: CardData,
    selectedPower: Power,
    opponentSelectedPower: Power,
    playerScore: number,
    opponentScore: number,
    calculateTypeAdvantage: (playerType: Type, opponentType: Type) => number,
    calculateCombatAdvantage: (power1: Power, power2: Power) => number
  ): { newPlayerScore: number; newOpponentScore: number; size: SizePresets} {
    let playerValue = selectedPower.value;
    let opponentValue = opponentSelectedPower.value;
  
    // Calculate type and combat advantages
    playerValue += calculateTypeAdvantage(
      playerActiveCard.type[0]!,
      opponentActiveCard.type[0]!
    );
    opponentValue += calculateTypeAdvantage(
      opponentActiveCard.type[0]!,
      playerActiveCard.type[0]!
    );
    playerValue += calculateCombatAdvantage(selectedPower, opponentSelectedPower);
    opponentValue += calculateCombatAdvantage(opponentSelectedPower, selectedPower);
  
    // Initialize new scores and size
    let newPlayerScore = playerScore;
    let newOpponentScore = opponentScore;
    let size = "medium" as SizePresets;

    // Update scores and size based on combat results
    if (playerValue > opponentValue) {
      newPlayerScore += 1;
      size = "tall" as SizePresets;
    } else if (opponentValue > playerValue) {
      newOpponentScore += 1;
      size = "tall" as SizePresets;
    }
  
    return { newPlayerScore, newOpponentScore, size };
  }
  

// ========== GAME OVER FUNCTIONS ==========
export function checkGameOver(gameState: GameState): boolean {
  const maxScore = Math.max(...gameState.score);
  return maxScore >= 4 || gameState.turnCount >= 8;
}

export function determineWinner(gameState: GameState): Player | null {
  const [scoreP1, scoreP2] = gameState.score;
  const winner =
    scoreP1 > scoreP2 ? "player" : scoreP2 > scoreP1 ? "opponent" : null;
  gameLog.winner = winner;
  return winner;
}
// win attestation
export function finalizeGame(
    playerScore: number,
    opponentScore: number,
    turnCount: number,
    gameLog: GameLog
    ): {winner: Winner, updatedGameLog: GameLog}{
        let provWinner: Winner = null;
        if (playerScore >= 4 || opponentScore >= 4 || turnCount >= 8) {
            provWinner = (
                playerScore > opponentScore
                ? "player"
                :(
                    playerScore < opponentScore
                    ? "opponent"
                    : null)); // Handle a tie or no winner yet    
        }
        const updatedGameLog: GameLog = {
            ...gameLog,
            winner: provWinner,
        };
        return {winner: provWinner, updatedGameLog};
}

// ========== COMBAT FUNCTIONS ==========
// Calculate type advantage
export function calculateTypeAdvantage(
  playerType: Type,
  opponentType: Type
): number {
  if (
    (playerType.type === "Cat" && opponentType.type === "Meme") ||
    (playerType.type === "Meme" && opponentType.type === "Dog") ||
    (playerType.type === "Dog" && opponentType.type === "Cat")
  ) {
    return 8;
  }
  return 0;
}
// Calculate combat advantage
export function calculateCombatAdvantage(
  playerPower: Power,
  opponentPower: Power
): number {
  if (
    (playerPower.type === "attack" && opponentPower.type === "defense") ||
    (playerPower.type === "defense" && opponentPower.type === "speed") ||
    (playerPower.type === "speed" && opponentPower.type === "attack")
  ) {
    return 4;
  }
  return 0;
}


// ========== CHOOSE FUNCTIONS ==========
/*const chooseCard = (player: "P1" | "P2", index: number) => {
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
  */

// =========== DUMP ==========
