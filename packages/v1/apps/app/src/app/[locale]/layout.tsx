import "@v1/ui/globals.css";
import { cn } from "@v1/ui/cn";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import FlickeringGrid from "@/components/magic-ui/flickering-grid-rounded";
import AltContainer from "@/components/container/alternate-bg";
import DashboardSidebar from "@/components/sidebar/index";
import React95App from "@/lib/context/react95";
import { Web3AuthProvider } from "@/lib/context/web3auth";
import { Toaster } from "@v1/ui/toaser";
import Room from "../Room";
import TransactionDrawer from "@/components/transaction-drawer";
import { LogsProvider } from "@/lib/context/logs.context";

export const metadata: Metadata = {
  metadataBase: new URL("https://cats-dogs-memes-etc.wtf"),
  title: "Cats, Dogs, Memes & Etc.",
  description: "Memestic memes for card playing memelords.",
};

const DepartureMono = localFont({
  src: "../fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure-mono",
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${DepartureMono.variable} ${GeistSans.variable} ${GeistMono.variable}`,
          "antialiased"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Web3AuthProvider>
            <React95App>
              {/* NAVBAR */}
                <LogsProvider>
                  <Navbar />
                  {/* MAIN LAYOUT */}
                  <div className="flex h-screen">
                    {/* LEFT SIDEBAR */}
                    <div className="flex pr-3">
                      <AltContainer>
                        <DashboardSidebar />
                      </AltContainer>
                    </div>
                    {/* MAIN CONTENT */}
                    <main className="flex-grow">
                      <div className="relative flex-shrink h-screen">
                        <div className="absolute inset-0 z-0 ">
                          <FlickeringGrid />
                        </div>
                        <div className="relative z-1 px-5 py-2 max-h-fit">
                          {children}
                          {/* <TransactionDrawer /> */}
                        </div>
                      </div>
                    </main>
                  </div>
                  {/* CLOSING LINE */}
                  <Footer />
                </LogsProvider>
            </React95App>
          </Web3AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
