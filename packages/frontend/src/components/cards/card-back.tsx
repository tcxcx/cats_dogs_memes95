import React from "react";
import { Card2 as Card, CardContent } from "@/components/ui/card2";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";

export function CardBack() {
  return (
    <div className="relative w-64 flex mx-auto">
      <div className="absolute text-xs top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-200 px-4 py-1 rounded-full border-2 border-black z-10"></div>
      <Card className="relative w-full h-96 flex bg-gray-200 border-4 border-black/5 rounded-2xl overflow-hidden">
        <CardContent className="px-1 py-1 h-full flex flex-col justify-center items-center">
          <Image
            src="/CardbackS1_2.jpg"
            alt="Card Back"
            layout="fill"
            objectFit="cover"
            priority
            className="rounded-lg"
          />
        </CardContent>
      </Card>
    </div>
  );
}
