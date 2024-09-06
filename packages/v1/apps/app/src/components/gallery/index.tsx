"use client";

import { useEffect, useState, useMemo } from "react";
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
import CardImageSkeleton from "@/components/skeletons/card-image-skeleton";
import { useUserStore } from "@/lib/context/web3auth/user";
import { getPlayerStatus, getPlayerDeck } from "@/app/api/rollup/route";
import { useAction } from "@/lib/hooks/useAction";
import { v4 as uuidv4 } from "uuid";
import { Alert, AlertTitle, AlertDescription } from "@v1/ui/alert";
import { Suspense } from "react";

export default function GalleryComponent() {
  const { deck, addToDeck, removeFromDeck, saveDeck, clearDeck } =
    useDeckStore();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");
  const { submit } = useAction();
  const { addressContext, nameContext } = useUserStore();
  const [isRegistered, setIsRegistered] = useState(false);
  const [deckRegistered, setDeckRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (addressContext) {
        try {
          const status = await getPlayerStatus(addressContext);
          setIsRegistered(status.registered);
          setDeckRegistered(status.deckRegistered);
        } catch (error) {
          console.error("Failed to fetch player status:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlayerData();
  }, [addressContext]);

  const handleRegister = async () => {
    if (deck.length !== 10) {
      toast({
        title: "Deck Incomplete",
        description: "Please add exactly 10 cards to your deck.",
        variant: "destructive",
      });
      return;
    }

    const playerId = uuidv4();
    const deckString = JSON.stringify(deck.map((card) => card.id));
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      if (!isRegistered) {
        await submit("registerPlayer", {
          playerId,
          playerName: nameContext,
          deck: deckString,
          walletAddress: addressContext,
          timestamp,
        });
        toast({
          title: "Player Registered",
          description: "You have successfully registered for the tournament.",
        });
      }

      await submit("registerDeck", {
        playerId,
        deck: deckString,
        walletAddress: addressContext,
        timestamp,
      });

      toast({
        title: "Deck Registered",
        description: "Your deck has been successfully registered.",
      });

      setIsRegistered(true);
      setDeckRegistered(true);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description:
          "There was an issue with registering your deck. Please try again.",
        variant: "destructive",
      });
      console.error("Error registering player or deck:", error);
    }
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

  if (loading) {
    return <CardImageSkeleton />;
  }

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
                    {!deckRegistered && (
                      <Button
                        onClick={() => removeFromDeck(card.id)}
                        className="absolute top-0 right-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        size="sm"
                        aria-label={`Remove ${card.name} from deck`}
                      >
                        X
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Suspense>

            <div className="flex justify-center mt-6">
              {deck.length < 10 && (
                <Alert variant="destructive">
                  <AlertTitle>Not Enough Cards</AlertTitle>
                  <AlertDescription>
                    You need to add more cards to reach the required 10 cards.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={deck.length !== 10 || deckRegistered}
                onClick={handleRegister}
              >
                {deckRegistered ? "Deck Already Registered" : "Register Deck"}
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
