import { create } from "zustand";

interface UserState {
  addressContext: string | null;
  nameContext: string | null;
  setAddressContext: (address: string | null) => void;
  setNameContext: (name: string | null) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  addressContext: null,
  nameContext: null,
  setAddressContext: (address) => set({ addressContext: address }),
  setNameContext: (name) => set({ nameContext: name }),
  reset: () => set({ addressContext: null, nameContext: null }),
}));
