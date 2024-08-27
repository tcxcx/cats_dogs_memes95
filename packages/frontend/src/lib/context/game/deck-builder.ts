import create from "zustand";
import { CardData } from "@/lib/types";

interface DeckState {
  deck: CardData[];
  addToDeck: (card: CardData) => void;
  removeFromDeck: (cardId: number) => void;
  saveDeck: () => void;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  deck: [],
  addToDeck: (card) =>
    set((state) => {
      const cardCount = state.deck.filter((c) => c.id === card.id).length;
      if (state.deck.length < 10 && cardCount < 3) {
        return { deck: [...state.deck, card] };
      }
      return state;
    }),
  removeFromDeck: (cardId) =>
    set((state) => ({
      deck: state.deck.filter((card) => card.id !== cardId),
    })),
  saveDeck: () => {
    const { deck } = get();
    // Mock saving to database
    setTimeout(() => {
      console.log("Deck saved to the database:", deck);
    }, 1000);
  },
}));
