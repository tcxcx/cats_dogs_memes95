import type { Metadata } from "next";
import "@/styles/globals.css";
import { DM_Sans as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import EmojiLine from "@/components/emoji-line";
export const metadata: Metadata = {
  title: "Cats, Dogs & Memes",
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
        className={cn(
          "min-h-screen bg-bg font-sans antialiased",
          fontSans.variable
        )}
      >
        <Navbar />

        {children}
        <EmojiLine />
      </body>
    </html>
  );
}
