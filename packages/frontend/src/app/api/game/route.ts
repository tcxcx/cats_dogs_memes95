import { NextRequest, NextResponse } from 'next/server';
import { initializeGame, playTurn, checkGameOver, determineWinner } from '@/lib/actions/game.actions';

export async function POST(req: NextRequest) {
    const { action, gameState, handIndexP1, atribIndexP1, handIndexP2, atribIndexP2 } = await req.json();

    let updatedGameState;

    switch (action) {
        case 'initialize':
            updatedGameState = initializeGame(gameState.deckP1, gameState.deckP2);
            break;
        case 'playTurn':
            updatedGameState = playTurn(gameState, handIndexP1, atribIndexP1, handIndexP2, atribIndexP2, gameState.types, gameState.powers);
            if (checkGameOver(updatedGameState)) {
                const winner = determineWinner(updatedGameState);
                return NextResponse.json({ gameState: updatedGameState, winner });
            }
            break;
        default:
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ gameState: updatedGameState });
}





/*
// cats_dogs_memes95/packages/frontend/src/app/api/send-otp/CardGame.ts
import { NextResponse } from 'next/server';
import { CardData , Power } from '@/lib/types';
import { userCards } from '@/lib/mock-cards';
// make this file a next response and next request that uses game actions file game/actions.ts in order to
//create a post and get methods to play the game as per the UI component in play route

let gameState: {
  player1Deck: CardData[];
  player2Deck: CardData[];
  player1Score: number;
  player2Score: number;
} = {
  player1Deck: [],
  player2Deck: [],
  player1Score: 0,
  player2Score: 0,
};

export async function POST(request: Request) {
  const { action, player1CardId, player2CardId, attribute }: any = await request.json();

  switch (action) {
    case 'start':
      return startGame();

    case 'playTurn':
      return playTurn(player1CardId, player2CardId, attribute);

    case 'checkWinner':
      return checkWinner();

    default:
      console.log('Invalid action');
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

function startGame() {
  gameState = {
    player1Deck: generateMockDeck(),
    player2Deck: generateMockDeck(),
    player1Score: 0,
    player2Score: 0,
  };

  console.log('Game started with the following state:', gameState);
  return NextResponse.json(gameState);
}

function generateMockDeck(): CardData[] {
  // Selecting a few cards from the userCards array
  return [
    userCards[0], // Ragamuffin
    userCards[1], // Burmese
    userCards[2], // Tonkinese
    userCards[3], // Siberian
    userCards[4], // Russian Blue
  ];
}

function playTurn(player1CardId: number, player2CardId: number, attribute: string) {
  const player1Card = gameState.player1Deck.find((card) => card.id === player1CardId);
  const player2Card = gameState.player2Deck.find((card) => card.id === player2CardId);

  if (!player1Card || !player2Card) {
    console.log('Invalid card selection:', { player1CardId, player2CardId });
    return NextResponse.json({ error: 'Invalid card selection' }, { status: 400 });
  }

  const player1Value = player1Card.powers.find((p: Power) => p.type === attribute)?.value || 0;
  const player2Value = player2Card.powers.find((p: Power) => p.type === attribute)?.value || 0;

  console.log(`Player 1 plays ${player1Card.name} with ${attribute} value ${player1Value}`);
  console.log(`Player 2 plays ${player2Card.name} with ${attribute} value ${player2Value}`);

  if (player1Value > player2Value) {
    gameState.player1Score++;
    console.log('Player 1 wins this turn!');
  } else if (player2Value > player1Value) {
    gameState.player2Score++;
    console.log('Player 2 wins this turn!');
  } else {
    console.log('This turn is a draw.');
  }

  console.log('Current game state:', gameState);
  return NextResponse.json({ gameState });
}

function checkWinner() {
  if (gameState.player1Score >= 4) {
    console.log('Player 1 wins the game!');
    return NextResponse.json({ winner: 'Player 1' });
  } else if (gameState.player2Score >= 4) {
    console.log('Player 2 wins the game!');
    return NextResponse.json({ winner: 'Player 2' });
  } else {
    console.log('No winner yet.');
    return NextResponse.json({ winner: null });
  }
}
*/