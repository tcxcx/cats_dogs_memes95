"use client";

import { useState } from "react";
import { Card2, CardContent } from "@/components/ui/card2";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardData, Power, Type } from "@/lib/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";

const typeColors = {
  Cat: "bg-pink-200",
  Meme: "bg-yellow-200",
  Dog: "bg-blue-200",
};

export function CardGame({
  card,
  onAddToDeck,
  inDeck,
}: {
  card: CardData;
  onAddToDeck?: () => void;
  inDeck?: boolean;
}) {
  const cardColor =
    typeColors[card.type[0]?.type as keyof typeof typeColors] || "bg-gray-200";

  return (
    <div className="relative w-full h-fit aspect-[3/4] mx-auto flex justify-center items-center">
      <Card2
        className={"relative w-full max-h-fit aspect-[2/3] ${cardColor} border-4 border-black/5 rounded-2xl overflow-hidden"}
      >
        {card.count > 1 && !inDeck && (
          <div className="absolute top-1 right-1 bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold border-2 border-black">
            {card.count}
          </div>
        )}
        <CardContent className="px-1 py-1 h-full flex flex-col">
          <div className="bg-white border-2 border-gray-700 -mb-1">
            <Input
              value={card.name}
              readOnly
              className="text-center font-bold border-none focus:ring-0"
              aria-label={`Card2 name: ${card.name}`}
            />
          </div>
          <div
            className={"flex-grow ${cardColor} -mb-1 border-2 border-gray-700 flex justify-center items-center"}
          >
            <AspectRatio ratio={1} className="bg-blue-200">
              <img
                src={card.asset1}
                alt={card.name}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
          <div className={`${cardColor} border-2 border-gray-700 px-2 py-1`}>
            <div className="relative text-center focus:ring-0 transform bg-white px-1 py-1 rounded-full border-2 border-gray-700 z-10 mb-2">
              <span
                className="text-center border-none bg-transparent focus:ring-0"
                aria-label={`Card2 subtype: ${card.subtype}`}
              >
                {card.subtype}
              </span>
            </div>
            <div className="flex justify-around mt-2">
              {card.powers.map((power, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center"
                  aria-label={`${power.type} power: ${power.value}`}
                >
                  <span className="text-2xl mr-1">
                    {power.type === "attack"
                      ? "⚔️"
                      : power.type === "defense"
                      ? "🛡️"
                      : "🪶"}
                  </span>
                  <span className="font-bold">{power.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card2>
    </div>
  );
}
