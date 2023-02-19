import type { StateCreator } from "zustand";
import type { CsgoInventory } from "../server/api/services/steam-service";

export interface InventorySlice {
  csgoInventory: CsgoInventory | null;
  setCsgoInventory: (csgoInventory: CsgoInventory) => void;
}

export const createInventorySlice: StateCreator<InventorySlice> = (set) => ({
  csgoInventory: null,
  setCsgoInventory: (csgoInventory) =>
    set((state) => ({ ...state, csgoInventory })),
});
