import { AnimatedText } from "@/components/animated-text";
import { CopyText } from "@/components/copy-text";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@v1/ui/tooltip";
import Image from "next/image";
import { RetroGrid } from "../../../../packages/ui/src/components/retrogrid";

export default function Page() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute -top-[118px] inset-0 bg-[linear-gradient(to_right,#c4a1ff_1px,transparent_1px),linear-gradient(to_bottom,#c4a1ff_1px,transparent_1px)] bg-[size:4.5rem_2rem] -z-10 [transform:perspective(1000px)_rotateX(-63deg)] h-[80%] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent pointer-events-none -z-10" />

      <h1 className="font-departure text-[40px] md:text-[84px] relative z-10 text-center h-[120px] md:h-auto leading-tight">
        <AnimatedText text="Cats, Memes, Dogs. etc." />
      </h1>
      <div>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src="/eth-online.png"
                width={100}
                height={100}
                alt="eth-online-2024"
                priority
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={15} className="text-xs">
              Cats, Dogs, Memes, etc: An open-source memestic dank memes card
              game hackathon project
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="justify-center text-center font-departure text-[40px] md:text-[84px] relative z-10 text-center h-[120px] md:h-auto leading-tight">
        In the world of cats and dogs, memes arise,
        On the blockchain, where their magic flies.
        Cards in hand, three to play,
        Choose your champion and join the fray.

        A cat beats a meme, a meme beats a dog,
        A dog beats a cat in the digital fog.
        Attack, defend, speed with pride,
        Who will win? The blockchain will decide.

        Draw your cards, prepare for the fight,
        Balance of power in day or night.
        Four points to win and earn your name,
        In the world of NFTs, this is the game.

        Pick your avatar, make your commands,
        Memelord supreme with the dankest demands!
        Trade, compete, and stand your ground,
        A champion of this metagame shall be crowned!
      </div>
      <div className="absolute -bottom-[280px] inset-0 bg-[linear-gradient(to_right,#c4a1ff_1px,transparent_1px),linear-gradient(to_bottom,#c4a1ff_1px,transparent_1px)] bg-[size:4.5rem_2rem] -z-10 [transform:perspective(560px)_rotateX(63deg)] pointer-events-none" />
      <div className="absolute w-full bottom-[100px] h-1/2  bg-gradient-to-bg from-bg to-transparent pointer-events-none -z-10" />
      <RetroGrid />
    </div>
  );
}
