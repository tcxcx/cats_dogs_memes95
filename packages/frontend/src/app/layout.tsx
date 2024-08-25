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

export const metadata: Metadata = {
  title: "Cats, Memes & Dogs",
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
        <React95App>
          <Navbar />
          <div className="flex">
            <div className="flex-shrink-1 pr-4">
              <AltContainer>
                <DashboardSidebar />
              </AltContainer>
            </div>
            <main className="flex-grow">
              <div className="relative min-h-[calc(100vh-64px)]">
                {" "}
                {/* Adjust 64px to match your Navbar height */}
                <div className="absolute inset-0 z-0">
                  <FlickeringGrid />
                </div>
                <div className="relative z-10 p-4">{children}</div>
              </div>
            </main>
          </div>
          <EmojiLine />
        </React95App>
      </body>
    </html>
  );
}
