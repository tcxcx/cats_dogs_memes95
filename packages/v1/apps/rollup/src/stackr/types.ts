
// === TOURNAMENT TYPES ===
export enum LogAction {
  WIN = "WIN",
  LOST = "LOST",
}

export type MatchRequest = {
  matchId: number;
};

export type LogRequest = {
  matchId: number;
  playerId: number;
};

export type LeaderboardEntry = {
  won: number;
  lost: number;
  points: number;
  id: number;
  name: string;
};

export type TournamentMeta = {
  season: number;
  startTime: number;
  endTime: number;
  winner: number;
  byes: { playerId: number; season: number }[];
};

export type Match = {
  id: number;
  player1Id: number;
  player2Id: number;
  scores: Record<string, number>;
  startTime: number;
  endTime: number;
  winnerId: number;
};

export type Player = {
  id: number;
  name: string;
  deck: string[];
};

export type Logs = {
  playerId: number;
  matchId?: number;
  timestamp: number;
  action: string;
};

export type TournamentState = {
  admins: string[];
  meta: TournamentMeta;
  matches: Match[];
  players: Player[];
  logs: Logs[];
};


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