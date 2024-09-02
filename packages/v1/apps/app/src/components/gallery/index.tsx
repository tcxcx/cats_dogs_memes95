"use client";

import { useDeckStore } from "@/lib/context/game/deck-builder";
import { ScrollArea } from "@v1/ui/scroll-area";
import { Button } from "@v1/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@v1/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@v1/ui/select";
import { userCards } from "@/lib/mock-cards";
import { CardGalleryComponent } from "@/components/cards/card-gallery";
import { useToast } from "@/components/use-toast";
import { useState, useMemo } from "react";
import CardImageSkeleton from "@/components/skeletons/card-image-skeleton";
import { Suspense } from "react";

export default function GalleryComponent() {
  const { deck, addToDeck, removeFromDeck, saveDeck } = useDeckStore();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");

  const handleSaveDeck = () => {
    saveDeck();
    toast({
      title: "Deck Saved",
      description: "Your deck has been successfully saved.",
    });
  };

  const filteredCards = useMemo(() => {
    return userCards.filter(
      (card) =>
        typeFilter === "all" || card.type.some((t) => t.type === typeFilter)
    );
  }, [typeFilter]);

  const cardTypes = [
    "all",
    ...Array.from(
      new Set(userCards.flatMap((card) => card.type.map((t) => t.type)))
    ),
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Deck Builder</h1>
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="deck">Deck ({deck.length}/10)</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <div className="flex flex-wrap gap-4 mb-4">
            <Select onValueChange={setTypeFilter} value={typeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {cardTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid p-4 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredCards.map((card) => {
                const cardCount = deck.filter((c) => c.id === card.id).length;
                return (
                  <CardGalleryComponent
                    key={card.id}
                    card={card}
                    onAddToDeck={() => addToDeck(card)}
                    inDeck={cardCount >= 3}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="deck">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <Suspense fallback={<CardImageSkeleton />}>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {deck.map((card, index) => (
                  <div key={index} className="relative">
                    <CardGalleryComponent card={card} inDeck />
                    <Button
                      onClick={() => removeFromDeck(card.id)}
                      className="absolute top-0 right-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      size="sm"
                      aria-label={`Remove ${card.name} from deck`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Suspense>

            <div className="flex justify-center mt-6">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={deck.length === 0}
                onClick={handleSaveDeck}
              >
                Save Deck
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
