import type { User } from "@prisma/client";
import { create } from "zustand";
import type { CsgoInventory } from "../server/api/services/steam-service";

type Store = {
  authUser: User | null;
  setAuthUser: (user: User | null) => void;
  showSteamLinkModal: boolean;
  setShowSteamLinkModal: (showModal: boolean) => void;
  // clean everything
  logout: () => void;
  csgoInventory: CsgoInventory | null;
  setCsgoInventory: (csgoInventory: CsgoInventory) => void;
  showProfileModal: boolean;
  setShowProfileModal: (showProfileModal: boolean) => void;
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
  csgoInventory: null,
  setCsgoInventory: (csgoInventory) =>
    set((state) => ({ ...state, csgoInventory })),
  showProfileModal: false,
  setShowProfileModal: (showModal) =>
    set((state) => ({ ...state, showProfileModal: showModal })),
}));

export default useStore;
