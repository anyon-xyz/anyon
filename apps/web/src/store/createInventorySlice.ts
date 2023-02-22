import type { StateCreator } from "zustand";
import type {
  CsgoInventory,
  Description,
} from "@anyon/api";

export interface InventorySlice {
  csgoInventory: CsgoInventory | null;
  setCsgoInventory: (csgoInventory: CsgoInventory) => void;
  openWrapModal: boolean;
  setOpenWrapModal: (openWrapModal: boolean) => void;
  selectItemToWrap: Description | null;
  setSelectItemToWrap: (item: Description) => void;
}

export const createInventorySlice: StateCreator<InventorySlice> = (set) => ({
  csgoInventory: null,
  setCsgoInventory: (csgoInventory) =>
    set((state) => ({ ...state, csgoInventory })),
  openWrapModal: false,
  setOpenWrapModal: (openWrapModal) =>
    set((state) => ({ ...state, openWrapModal: openWrapModal })),
  selectItemToWrap: null,
  setSelectItemToWrap: (item) =>
    set((state) => ({ ...state, selectItemToWrap: item })),
});
