"use client";
import Image from "next/image";
import Logo from "../logo";
import EmojiLine from "../emoji-line";

export default function Navbar() {
  return (
    <nav className="w-full px-10 pb-10">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Left side */}
        <div className="flex items-center flex-1 relative">
          <div className="absolute -left-8 top-2 transform -translate-y-1/2 flex items-center z-10">
            <Image
              src="/catemoji.png"
              alt="Funny Cat Logo Meme"
              width={50}
              height={50}
              className="rounded-full object-cover"
            />{" "}
          </div>
          <div className="w-full h-[1px] bg-black" />
        </div>

        {/* Center content */}
        <div className="flex flex-col items-center mx-4 z-20">
          <Image
            src="/pepe-bg.png"
            alt="Funny Pepe Logo Meme"
            width={75}
            height={75}
            className="rounded-full object-cover"
          />{" "}
        </div>

        {/* Right side */}
        <div className="flex items-center flex-1 justify-end relative">
          <div className="w-full h-[1px] bg-black" />
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 flex items-center z-10">
            <Image
              src="/dogemoji.png"
              alt="Funny Dog Logo Meme"
              width={75}
              height={75}
              className="rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
