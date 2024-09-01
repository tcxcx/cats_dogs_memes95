// MultiplayerCard.tsx
"use client";

import { FC, memo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useOthers, useUpdateMyPresence } from "@liveblocks/react"; // Import the necessary hooks
import { CardData } from "@/lib/types"; // Import your CardData type
import { CardGame } from "@/components/cards/card-game"; // Assuming this is your game card component

type PresenceData = {
  [key: string]: { x: number; y: number }; // Define the expected structure of the presence data
};

type MultiplayerCardProps = {
  card: CardData;
  initialPos: { x: number; y: number };
  cardId: string; // A unique identifier for the card, e.g., card.name or ID
};

// The MultiplayerCard component now handles rendering and dragging of the CardGame component
const MultiplayerCard: FC<MultiplayerCardProps> = ({ card, initialPos, cardId }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const others = useOthers(); // Use without generic argument
  const updateMyPresence = useUpdateMyPresence(); // Call without type argument

  // Update presence with card position when dragging
  return (
    <motion.div
      ref={cardRef}
      drag
      onDrag={(event, info) => {
        const { x, y } = info.point;
        if (cardRef.current) {
          cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          updateMyPresence({ [cardId]: { x, y } });
        }
      }}
      className="cursor-pointer"
      style={{ position: "absolute", top: 0, left: 0 }}
      onAnimationStart={() => {}} // Add a dummy function to satisfy the type requirement
    >
      <CardGame card={card} /> {/* Wrap CardGame component */}
      {/* Render other users' cursors near the card */}
      {others.map(({ connectionId, presence }) => {
        const otherPosition = presence?.[cardId];
        if (otherPosition && typeof otherPosition === 'object' && 'x' in otherPosition && 'y' in otherPosition) {
          return (
            <motion.div
              key={connectionId}
              style={{
                position: "absolute",
                top: otherPosition.y as number,
                left: otherPosition.x as number,
                backgroundColor: "rgba(255, 0, 0, 0.5)",
                width: 20,
                height: 20,
                borderRadius: "50%",
              }}
            >
              {/* Additional UI, such as the user's name, can be added here */}
            </motion.div>
          );
        }
        return null;
      })}
    </motion.div>
  );
};

export default memo(MultiplayerCard);
