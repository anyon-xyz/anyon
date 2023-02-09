import type { User } from "@prisma/client";
import { create } from "zustand";

type Store = {
  authUser: User | null;
  setAuthUser: (user: User | null) => void;
  showSteamLinkModal: boolean;
  setShowSteamLinkModal: (showModal: boolean) => void;
  // clean everything
  logout: () => void;
};

const useStore = create<Store>((set) => ({
  authUser: null,
  setAuthUser: (user) => set((state) => ({ ...state, authUser: user })),
  showSteamLinkModal: false,
  setShowSteamLinkModal: (showModal) =>
    set((state) => ({ ...state, showSteamLinkModal: showModal })),
  logout: () => {
    set({});
  },
}));

export default useStore;
