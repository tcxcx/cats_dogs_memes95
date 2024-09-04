import { create } from 'zustand';

type DynamicIslandState = {
  message: string | null;
  isVisible: boolean;
  setMessage: (message: string | null) => void;
  setVisibility: (isVisible: boolean) => void;
};

export const useDynamicIslandStore = create<DynamicIslandState>((set) => ({
  message: null,
  isVisible: false,
  setMessage: (message) => set({ message }),
  setVisibility: (isVisible) => set({ isVisible }),
}));