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
    GameLog
} from '@/lib/types'; // Assuming these types exist based on your project structure
import { userCards } from '@/lib/mock-cards';

// Mock deck for demonstration purposes
const Deck1: Deck = shuffleDeck([...userCards].slice(0, 10).map((card) => card.name).filter((name): name is string => name !== undefined));
const Deck2: Deck = shuffleDeck([...userCards].slice(0, 10).map((card) => card.name).filter((name): name is string => name !== undefined));

const iniHandP1: CardData[] = Deck1.map((cardName) => cardCollection[cardName]).filter((card): card is CardData => card !== undefined).slice(0, 2);
const iniHandP2: CardData[] = Deck2.map((cardName) => cardCollection[cardName]).filter((card): card is CardData => card !== undefined).slice(0, 2);

const cardCollection: CardCollection = userCards.reduce((collection, card) => {
    if (card.name) {
        collection[card.name] = card; // Use card.name or card.id as the key, depending on your needs
    }
    return collection;
  }, {} as CardCollection);

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
  typeList: ['Cat', 'Dog', 'Meme'], // Assuming these are the types
};

// Mock Game log
let gameLog: GameLog = {
    initialDecks: {
        deckP1: [],
        deckP2: [],
    },
    turns: [],
    winner: null,
}

// Function to fetch the current game state
export async function fetchGameState(): Promise<GameState> {
  try {
    console.log("fetching game state");
    // Logic to retrieve the current game state
    // For this example, it's returning the mock state
    // In real scenarios, ensure this pulls from wherever you manage state (e.g., in-memory, database)
    return currentGameState;
  } catch (error) {
    console.error('Error fetching game state:', error);
    throw error; // Re-throw the error to handle it in the service or calling function
  }
}

function shuffleDeck(deck: Deck): Deck {
    return deck.sort(() => Math.random() - 0.5);
}

function drawInitialHand(deck: Deck): Hand {
    return deck.slice(0, 2).map((cardNameOrId) => cardCollection[cardNameOrId]).filter((card): card is CardData => card !== undefined);
}


function calculateTurnOutcome(
    coll: CardCollection,
    card1: string,
    card2: string,
    pow1: Power["type"],  // Now using Power type
    pow2: Power["type"],
    types: string[],
    powers: string[]
): TurnResult {
    const cardData1 = coll[card1];
    const cardData2 = coll[card2];
    if (!cardData1 || !cardData2) {
        throw new Error("One or both cards not found in the collection.");
    }
    let val1 = cardData1.powers.find(power => power.type === pow1)?.value ?? 0;
    let val2 = cardData2.powers.find(power => power.type === pow2)?.value ?? 0;
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
function buildCardCollection(cards: CardData[]): CardCollection {
    return cards.reduce((collection, card) => {
        collection[card.name] = card;
        return collection;
    }, {} as CardCollection);
}


// Game management
export function initializeGame(deckP1: Deck, deckP2: Deck): GameState {
    console.log("initializing game");
    const sDeckP1 = shuffleDeck(deckP1);
    const sDeckP2 = shuffleDeck(deckP2);
    console.log(sDeckP1);
    //console.log(sDeckP2);
    //console.log(drawInitialHand(deckP1), drawInitialHand(deckP2));
    //console.log(buildCardCollection(userCards));
    
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
    console.log(gameLog);
    return initialGameState;
}

// Function to update the game log after each turn
function updateGameLog(
    turnNumber: number,
    cardP1: CardData,
    cardP2: CardData,
    powerP1: Power,
    powerP2: Power,
    currentScore: Score
  ) {
    gameLog.turns.push({
      turnNumber,
      playedCards: { cardP1, cardP2, powerP1, powerP2 },
      currentScore: {
        player1Points: currentScore[0],
        player2Points: currentScore[1],
      },
    });
  }

export function playTurn(
    gameState: GameState,
    handIndexP1: number, // Index of the card in the player's hand
    powIndexP1: number, // Index of the power in the player's hand
    handIndexP2: number, // Index of the card in the opponent's hand
    powIndexP2: number, // Index of the power in the opponent's hand
    types: typeof TypeList,
    powers: typeof PowerList,
): GameState {
    const { deckP1, deckP2, handP1, handP2, score, turnCount, cardCollection } = gameState;
    // Check if indices are within the bounds of the hands
    if (
        handIndexP1 < 0 || handIndexP1 >= handP1.length ||
        handIndexP2 < 0 || handIndexP2 >= handP2.length
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
        score[1] + turnResult.player2Points];

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
    const finalHandP1: CardData[] = updatedHandP1.length ? updatedHandP1 : [...updatedHandP1, newCardP1!].filter(card => card !== undefined);
    const finalHandP2: CardData[] = updatedHandP2.length ? updatedHandP2 : [...updatedHandP2, newCardP2!].filter(card => card !== undefined);
    
    updateGameLog(turnCount + 1, playerCardP1, playerCardP2, gameState.powerList[powIndexP1], gameState.powerList[powIndexP2], updatedScore);

    console.log(gameLog);

    return {
        ...gameState,
        score: updatedScore,
        handP1: finalHandP1,
        handP2: finalHandP2,
        turnCount: turnCount + 1,
    };
}

export function checkGameOver(gameState: GameState): boolean {
    const maxScore = Math.max(...gameState.score);
    return maxScore >= 4 || gameState.turnCount >= 8;
}

export function determineWinner(gameState: GameState): number {
    const [scoreP1, scoreP2] = gameState.score;
    const winner = scoreP1 > scoreP2 ? 1 : scoreP2 > scoreP1 ? 2 : 0;
    gameLog.winner = winner;
    return winner;
}

///// DUMP
//use my game logic to create a game action file that will be used to constantly check the game engine and update the game state as per the rules
// which are written in python and I just translated them to typescript
// make sure you export all this functions to be used in next js app router using the API attach route in which the game logic is present
// needs to be separated as concerns and not mixed with the UI nor the API fetching