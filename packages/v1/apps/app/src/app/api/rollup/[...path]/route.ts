import { NextRequest, NextResponse } from "next/server";
import {
  getInfo,
  getPlayers,
  getMatches,
  getPlayerStatus,
  getPlayerDeck,
  getPlayer,
  getAwards,
  submitAction,
  getMatch,
  getPlayerLeaderboard,
} from "@/lib/apiClient";

const ROLLUP_URL =
  process.env.NEXT_PUBLIC_ROLLUP_URL || "http://localhost:3210";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");

  try {
    switch (path) {
      case "info":
        const info = await getInfo();
        return NextResponse.json(info);

      case "players":
        const players = await getPlayers();
        return NextResponse.json(players);

      case "matches":
        const matches = await getMatches();
        return NextResponse.json(matches);

      case "player-leaderboard":
        const leaderboard = await getPlayerLeaderboard();
        return NextResponse.json(leaderboard);

      case "awards":
        const awards = await getAwards();
        return NextResponse.json(awards);

      default:
        if (path.startsWith("player-status")) {
          const walletAddress = path.split("/").pop();
          if (walletAddress) {
            const status = await getPlayerStatus(walletAddress);
            return NextResponse.json(status);
          }
        } else if (path.startsWith("player-deck")) {
          const walletAddress = path.split("/").pop();
          if (walletAddress) {
            const deck = await getPlayerDeck(walletAddress);
            return NextResponse.json(deck);
          }
        } else if (path.startsWith("players/")) {
          const id = path.split("/").pop();
          if (id) {
            const player = await getPlayer(parseInt(id, 10));
            return NextResponse.json(player);
          }
        } else if (path.startsWith("matches/")) {
          const id = path.split("/").pop();
          if (id) {
            const match = await getMatch(parseInt(id, 10));
            return NextResponse.json(match);
          }
        }

        return NextResponse.json(
          { error: "Invalid path or missing parameters" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = new URL(path, ROLLUP_URL);

  try {
    const body = await request.json();
    const response = await submitAction(url.toString(), body);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
