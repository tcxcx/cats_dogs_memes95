import { urlJoin } from "@/lib/utils";
import { MRUInfo } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_ROLLUP_URL || "http://localhost:3210";

const get = async <T>(path = ""): Promise<T> => {
  const res = await fetch(urlJoin(BASE_URL, path));
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Failed to fetch ${path}:`, errorText);
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

const getInfo = async () => {
  return get<MRUInfo>("info");
};

const getState = async () => {
  return get<{ state: number }>();
};

const getPlayers = async () => {
  return get<any[]>("players");
};

const getMatch = async (id: number) => {
  return get<any>(`matches/${id}`);
};

const getMatches = async () => {
  return get<any[]>("matches");
};

const getPlayerLeaderboard = async () => {
  return get<any[]>("player-leaderboard");
};

const getPlayer = async (id: number) => {
  return get<any>(`players/${id}`);
};

const getAwards = async () => {
  return get<any>("awards");
};

/* SUBMIT ACTION */
const submitAction = async (
  path: string,
  data: any
): Promise<{
  logs: { name: string; value: number }[];
  ackHash: string;
}> => {
  const res = await fetch(urlJoin(BASE_URL, path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if ((json as any).error) {
    throw new Error((json as any).error);
  }
  return json;
};

// Add the new exports here
export {
  getInfo,
  getState,
  submitAction,
  getPlayers,
  getMatch,
  getMatches,
  getPlayerLeaderboard,
  getPlayer,
  getAwards,
};
