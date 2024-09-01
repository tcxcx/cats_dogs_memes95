import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LiveList } from '@liveblocks/client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const classNames = (...classes: string[]): string => classes.filter(Boolean).join(' ')

export const CURSOR_COLORS = ['#DC2626', '#D97706', '#059669', '#7C3AED', '#DB2777']
export const CURSOR_NAMES = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐸', '🐷', '🐵', '🦄', '🦀', '🐝']