import type { Metadata } from "next";
import "@/styles/globals.css";
import { DM_Sans as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import EmojiLine from "@/components/emoji-line";
import FlickeringGrid from "@/components/magic-ui/flickering-grid-rounded";
import AltContainer from "@/components/container/alternate-bg";
import DashboardSidebar from "@/components/sidebar/index";
import React95App from "@/lib/context/react95";
import { Web3AuthProvider } from "@/lib/context/web3auth";
import { Toaster } from "@/components/ui/toaster";
import { Room } from "./Room";

export const metadata: Metadata = {
  title: "Cats, Memes & Dogs, etc., etc.",
  description: "Memestic memes",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn("min-h-screen font-sans antialiased", fontSans.variable)}
      >
        <Web3AuthProvider>
          <React95App>
          <Room>
            <Navbar />
            <div className="flex">
              <div className="flex-shrink-1 pr-3">
                <AltContainer>
                  <DashboardSidebar />
                </AltContainer>
              </div>
              <main className="flex-grow">
                <div className="relative">
                  {" "}
                  <div className="absolute inset-0 z-0 ">
                    <FlickeringGrid />
                  </div>
                  <div className="relative z-1 p-3">{children}</div>
                </div>
              </main>
            </div>
            <EmojiLine />
            </Room>
          </React95App>
        </Web3AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
