import type { User } from "@prisma/client";
import type { StateCreator } from "zustand";

export interface UserSlice {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  showSteamLinkModal: boolean;
  setShowSteamLinkModal: (showSteamLinkModal: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (showProfileModal: boolean) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  isLoggedIn: false,
  user: null,
  setIsLoggedIn: (isLoggedIn) => set((state) => ({ ...state, isLoggedIn })),
  setUser: (user) => set((state) => ({ ...state, user })),
  showSteamLinkModal: false,
  setShowSteamLinkModal: (showModal) =>
    set((state) => ({ ...state, showSteamLinkModal: showModal })),
  showProfileModal: false,
  setShowProfileModal: (showModal) =>
    set((state) => ({ ...state, showProfileModal: showModal })),
});
