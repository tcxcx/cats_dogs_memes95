"use client";
import Image from "next/image";
import Web3AuthDialog from "@/components/web3auth-dialog";
import Logo from "../logo";

export default function Navbar() {
  return (
    <nav className="w-full px-10">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Left side */}
        <div className="flex items-center flex-1 relative">
          <div className="absolute -left-8 top-2 transform -translate-y-1/2 flex items-center z-10">
            <Image src="/Frame.svg" alt="Left Frame" width={100} height={100} />
          </div>
          <div className="w-full h-[1px] bg-black" />
        </div>

        {/* Center content */}
        <div className="flex flex-col items-center mx-4 z-20">
          <Logo />
          <code className="font-mono font-bold mt-2">
            Cats, Memes & Dogs, etc.
          </code>
        </div>

        {/* Right side */}
        <div className="flex items-center flex-1 justify-end relative">
          <div className="w-full h-[1px] bg-black" />
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center z-10">
            <Web3AuthDialog />
          </div>
        </div>
      </div>
    </nav>
  );
}
