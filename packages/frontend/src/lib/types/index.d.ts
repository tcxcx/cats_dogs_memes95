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

// ========================================

export declare type Power = {
  type: "attack" | "defense" | "speed";
  value: number;
};

// ========================================

export declare type Type = {
  type: "Cat" | "Dog" | "Meme";
  value: number;
};

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

// Collection of cards, keyed by card names
export type CardCollection = {
    [cardName: string]: CardData;
};

// ========================================

// A Deck is an array of card names (strings) representing the cards in a player's deck
export type Deck = string[];

// ========================================

// A Hand is an array of card names (strings) representing the cards a player has drawn
export type Hand = string[];

// ========================================

export type Score = [number, number]; // player1Points, player2Points

// ========================================

// The GameState stores the current state of the game
export type GameState = {
    deckP1: Deck;
    deckP2: Deck;
    handP1: Hand;
    handP2: Hand;
    score: Score;
    turnCount: number;
    cardCollection: CardCollection;
    powerList: Power.type[];
    typeList: string[];
};

// ========================================

// The result of a turn, indicating how many points each player scored
export type TurnResult = {
    player1Points: number;
    player2Points: number;
};


// ========================================
// camera view component
export type Point = { x: number; y: number }
export type Size = { width: number; height: number }

export type Camera = { x: number; y: number; z: number }
export type Box = {
	minX: number
	minY: number
	maxX: number
	maxY: number
	width: number
	height: number
}