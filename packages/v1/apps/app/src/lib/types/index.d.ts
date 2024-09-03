/* eslint-disable no-unused-vars */
export {};

export declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// ========================================

export declare type UserInfo = {
  email: string;
  name: string;
  picture: string;
};

export type Player = "player" | "opponent";
export type GamePhase = "draw" | "prep" | "combat" | "check";
export type Winner = "player" | "opponent" | null;

// === CARD TYPES ===
// ========================================

export declare type CardData = {
  id: number;
  name: string;
  type: Type[];
  subtype: string;
  powers: Power[];
  count: number;
  asset1?: string;
};

// ========================================

export declare type Power = {
  type: "attack" | "defense" | "speed";
  value: number;
};
export const PowerList: Power["type"][];

// ========================================

export declare type Type = {
  type: "Cat" | "Dog" | "Meme";
  value: number;
};
export const TypeList: Type["type"][];

// === COLLECTION TYPES ===
// ========================================

// Collection of cards, keyed by card names
export type CardCollection = Record<string, CardData>;

// ========================================

// === GAME TYPES ===
// A Deck is an array of card names (strings) representing the cards in a player's deck
export type Deck = string[];

// ========================================

// A Hand is an array of card names (strings) representing the cards a player has drawn
export type Hand = CardData[];

// ========================================

export type Score = [number, number]; // player1Points, player2Points

// ========================================

// The GameState stores the current state of the game
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

// ========================================

// The result of a turn, indicating how many points each player scored
export type TurnResult = {
  player1Points: number;
  player2Points: number;
};

// ========================================

export type GamePhase = "draw" | "prep" | "combat" | "check";

// ========================================

export type GameLog = {
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

// ========================================
// camera view component
export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

export type Camera = { x: number; y: number; z: number };
export type Box = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};
