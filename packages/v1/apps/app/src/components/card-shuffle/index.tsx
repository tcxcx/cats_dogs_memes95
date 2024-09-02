"use client";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CardSingle } from "@/components/cards/card";
import { Button } from "@v1/ui/button";
import { Shuffle } from "lucide-react";
import { userCards } from "@/lib/mock-cards";
import { CardBack } from "@/components/cards/card-back";
import { CardSmall } from "../cards/card-small";
import { CardData } from "@/lib/types";

function shuffleArray(array: CardData[]): CardData[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function CardPackViewer() {
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [purchasedPack, setPurchasedPack] = useState<number | null>(null);
  const [revealedFirst, setRevealedFirst] = useState(false);
  const [revealedAll, setRevealedAll] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<CardData[]>(userCards);
  const containerRef = useRef<HTMLDivElement>(null);

  const numberOfPacks = shuffledCards.length;
  const radius = 20; // Adjust this value to control the spread of the fan
  const firstPackAngle = -90; // Start the fan from this angle
  const openAngle = 180; // Control the spread of the fan

  useEffect(() => {
    setShuffledCards(shuffleArray([...userCards]));
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      if (!revealedAll) {
        setSelectedPack(null);
        setPurchasedPack(null);
        setRevealedFirst(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [revealedAll]);

  const handlePackSelect = (packId: number) => {
    setSelectedPack(packId);
    setPurchasedPack(null);
    setRevealedFirst(false);
    setRevealedAll(false);
  };

  const handlePurchase = () => {
    if (selectedPack !== null) {
      setPurchasedPack(selectedPack);
      setRevealedFirst(true);
    }
  };

  const handlePickAnother = () => {
    const remainingPacks = shuffledCards.filter(
      (_, index) => index !== selectedPack
    );
    const randomPack =
      remainingPacks[Math.floor(Math.random() * remainingPacks.length)];
    setSelectedPack(shuffledCards.indexOf(randomPack));
    setPurchasedPack(null);
    setRevealedFirst(false);
    setRevealedAll(false);
  };

  const handleRevealAll = () => {
    setRevealedAll(true);
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center px-6 py-8">
      <div
        ref={containerRef}
        className="relative h-[600px] w-[600px] flex items-center justify-center"
      >
        <AnimatePresence>
          {shuffledCards.map((card, index) => {
            const fixedAngle =
              (openAngle / (numberOfPacks - 1)) * index + firstPackAngle;
            const fixedtranslateX =
              Math.sin(fixedAngle * (Math.PI / 180)) * radius;
            const fixedtranslateY =
              Math.cos(fixedAngle * (Math.PI / 180)) * radius;
            const fixedrotate =
              (openAngle / (numberOfPacks - 1)) * index + firstPackAngle;

            const variants = {
              selected: {
                translateX: 0,
                translateY: -100, // Adjust this value to lift the selected card
                rotate: 0,
                scale: 1.5,
                zIndex: 10,
                transition: {
                  duration: 0.5,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                },
              },
              unselected: {
                translateX: fixedtranslateX,
                translateY: fixedtranslateY,
                rotate: fixedrotate,
                scale: 0.8,
                opacity: 0.5,
                transition: { duration: 0.5 },
              },
              initial: {
                translateX: fixedtranslateX,
                translateY: fixedtranslateY,
                rotate: fixedrotate,
                transition: { duration: 0.2 },
              },
            };

            return (
              <motion.div
                key={card.id} // Use card.id for a unique key
                animate={
                  selectedPack === index
                    ? "selected"
                    : selectedPack !== null
                    ? "unselected"
                    : "initial"
                }
                variants={variants}
                onClick={() => handlePackSelect(index)}
                className="absolute cursor-pointer"
                style={{ transformOrigin: "bottom center" }}
              >
                <motion.div
                  initial={{ rotateY: 180 }}
                  animate={
                    purchasedPack === index && revealedFirst
                      ? { rotateY: 0 }
                      : { rotateY: 180 }
                  }
                  transition={{ duration: 0.8 }}
                  className="relative w-64 h-96"
                >
                  {!revealedFirst || purchasedPack !== index ? (
                    <CardBack />
                  ) : (
                    <CardSingle card={card} />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {selectedPack !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            {!purchasedPack ? (
              <div className="space-y-4">
                <Button
                  onClick={handlePurchase}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                >
                  Purchase Pack
                </Button>
                <Button
                  onClick={handlePickAnother}
                  className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
                >
                  <Shuffle className="mr-2 h-4 w-4" /> Pick Another
                </Button>
              </div>
            ) : revealedFirst && !revealedAll ? (
              <Button
                onClick={handleRevealAll}
                className="bg-yellow-500 hover:bg-yellow-400 text-white"
              >
                View Remaining Cards
              </Button>
            ) : revealedAll ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center gap-4"
              >
                {shuffledCards.slice(1, 5).map((card, index) => (
                  <motion.div
                    key={card.id} // Use card.id for a unique key
                    initial={{ opacity: 0, rotateY: 180 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative rounded-lg overflow-hidden shadow-lg"
                  >
                    <CardSmall card={card} />
                  </motion.div>
                ))}
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
}
