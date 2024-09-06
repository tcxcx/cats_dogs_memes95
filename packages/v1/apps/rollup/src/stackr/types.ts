// === TOURNAMENT TYPES ===
export enum LogAction {
  WIN = "WIN",
  LOST = "LOST",
}

export type MatchRequest = {
  matchId: string;
};

export type LogRequest = {
  matchId: string;
  playerId: string;
};

export type LeaderboardEntry = {
  won: number;
  lost: number;
  points: number;
  id: string;
  name: string;
};

export type TournamentMeta = {
  season: number;
  startTime: number;
  endTime: number;
  winner: string;
  byes: { playerId: string; season: string }[];
};

export type Match = {
  id: string;
  player1Id: string;
  player2Id: string;
  scores: Record<string, number>;
  startTime: number;
  endTime: number;
  winnerId: string;
};

export type Player = {
  id: string;
  name: string;
  deck: string[];
  walletAddress: string;
};

export type Logs = {
  playerId: string;
  matchId?: string;
  timestamp: number;
  action: string;
};

export interface TournamentState {
  players: Player[];
  matches: Match[];
  logs: Logs[];
  meta: {
    season: number;
    startTime: number;
    endTime: number;
  };
  admins: string[];
}

// === GAME STATE TYPES ===
export type Deck = string[];

export type Hand = CardData[];

export declare type CardData = {
  id: number;
  name: string;
  type: Type[];
  subtype: string;
  powers: Power[];
  count: number;
  asset1?: string;
};

export type PlayTurnInput = {
  playerActiveCard: CardData;
  opponentActiveCard: CardData;
  selectedPower: Power;
  opponentSelectedPower: Power;
};

export declare type Type = {
  type: "Cat" | "Dog" | "Meme";
  value: number;
};

export type Score = [number, number]; // player1Points, player2Points

export type CardCollection = Record<string, CardData>;

export declare type Power = {
  type: "attack" | "defense" | "speed";
  value: number;
};

export type PowerList = Power["type"][];
export type TypeList = Type["type"][];

export type GameState = {
  deckP1: Deck;
  deckP2: Deck;
  handP1: CardData[];
  handP2: CardData[];
  score: Score;
  turnCount: number;
  cardCollection: CardCollection;
  powerList: PowerList;
  typeList: TypeList;
};

export type Winner = "player" | "opponent" | null;

type GameLog = {
  initialDecks: {
    deckP1: Deck;
    deckP2: Deck;
  };
  turns: {
    turnNumber: number;
    playedCards: {
      cardP1: CardData;
      cardP2: CardData;
      powerP1: Power;
      powerP2: Power;
    };
    currentScore: {
      player1Points: number;
      player2Points: number;
    };
  }[];
  winner: Winner;
};

export type GameStateLog = {
  deckP1: Deck;
  deckP2: Deck;
  handP1: CardData[];
  handP2: CardData[];
  score: [number, number];
  turnCount: number;
  cardCollection: CardCollection;
  powerList: Power["type"][];
  typeList: Type["type"][];
  gameLog: GameLog;
  winner: any;
};
