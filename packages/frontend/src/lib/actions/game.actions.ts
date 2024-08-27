//use my game logic to create a game action file that will be used to constantly check the game engine and update the game state as per the rules
// which are written in python and I just translated them to typescript
// make sure you export all this functions to be used in next js app router using the API attach route in which the game logic is present
// needs to be separated as concerns and not mixed with the UI nor the API fetching
import { CardCollection, Deck, Hand, GameState, Score, TurnResult, CardData, Power } from '@/lib/types'; // Assuming these types exist based on your project structure
import { userCards } from '@/lib/mock-cards';

// Utility functions based on the Python logic
function shuffleDeck(deck: Deck): Deck {
    return deck.sort(() => Math.random() - 0.5);
}

function drawInitialHand(deck: Deck): Hand {
    return deck.slice(0, 3);
}
function isValidAttribute(key: string): key is keyof CardData {
    return key === "Atk" || key === "HP" || key === "Spd" || key === "Type";
}


function calculateTurnOutcome(
    coll: CardCollection,
    card1: string,
    card2: string,
    pow1: Power,  // Now using Power type
    pow2: Power,
    types: string[],
    powers: string[]
): TurnResult {
    let val1 = coll[card1].powers.find(power => power.type === pow1.type)?.value || 0;
    let val2 = coll[card2].powers.find(power => power.type === pow2.type)?.value || 0;
    const type1 = coll[card1].type[0].type;
    const type2 = coll[card2].type[0].type;
    const type1Index = types.indexOf(type1);
    const type2Index = types.indexOf(type2);

    if (type1Index === -1 || type2Index === -1) {
        throw new Error("Type not found in the type list.");
    }

    const pow1Index = powers.indexOf(pow1.type);
    const pow2Index = powers.indexOf(pow2.type);

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
    return {
        deckP1: shuffleDeck(deckP1),
        deckP2: shuffleDeck(deckP2),
        handP1: drawInitialHand(deckP1),
        handP2: drawInitialHand(deckP2),
        score: [0, 0],
        turnCount: 0,
        cardCollection: buildCardCollection(userCards),
        powerList: ["attack", "defense", "speed"],
        typeList: ["Cat", "Dog", "Meme"],
    };
}

export function playTurn(
    gameState: GameState,
    handIndexP1: number,
    powIndexP1: number,
    handIndexP2: number,
    powIndexP2: number,
    types: string[],
    powers: string[]
): GameState {
    const { deckP1, deckP2, handP1, handP2, score, turnCount } = gameState;

    const turnResult = calculateTurnOutcome(
        gameState.cardCollection,
        handP1[handIndexP1],
        handP2[handIndexP2],
        gameState.powerList[powIndexP1],
        gameState.powerList[powIndexP2],
        types,
        powers
    );

    // Update score and hands
    const updatedScore: Score = [score[0] + turnResult.player1Points, score[1] + turnResult.player2Points];
    const updatedHandP1 = handP1.filter((_, idx) => idx !== handIndexP1);
    const updatedHandP2 = handP2.filter((_, idx) => idx !== handIndexP2);

    return {
        ...gameState,
        score: updatedScore,
        handP1: updatedHandP1.length ? updatedHandP1 : [...updatedHandP1, deckP1[turnCount + 3]],
        handP2: updatedHandP2.length ? updatedHandP2 : [...updatedHandP2, deckP2[turnCount + 3]],
        turnCount: turnCount + 1,
    };
}

export function checkGameOver(gameState: GameState): boolean {
    const maxScore = Math.max(...gameState.score);
    return maxScore >= 4 || gameState.turnCount >= 8;
}

export function determineWinner(gameState: GameState): number {
    const [scoreP1, scoreP2] = gameState.score;
    return scoreP1 > scoreP2 ? 1 : scoreP2 > scoreP1 ? 2 : 0;
}
