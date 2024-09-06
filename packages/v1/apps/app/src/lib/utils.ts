import { LiveList } from "@liveblocks/client";

export const classNames = (...classes: string[]): string =>
  classes.filter(Boolean).join(" ");

export const CURSOR_COLORS = [
  "#DC2626",
  "#D97706",
  "#059669",
  "#7C3AED",
  "#DB2777",
];
export const CURSOR_NAMES = [
  "🐶",
  "🐱",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐸",
  "🐷",
  "🐵",
  "🦄",
  "🦀",
  "🐝",
];

export function formatHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function urlJoin(...parts: string[]) {
  return parts.map((part) => part.replace(/\/$/, "")).join("/");
}