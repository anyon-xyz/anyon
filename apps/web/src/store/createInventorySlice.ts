import type { Asset, CsgoInventory, Description } from "@anyon/api";
import type { StateCreator } from "zustand";

export interface InventorySlice {
  csgoInventory: CsgoInventory | null;
  setCsgoInventory: (csgoInventory: CsgoInventory) => void;
  openWrapModal: boolean;
  setOpenWrapModal: (openWrapModal: boolean) => void;
  selectItemToWrap: Description | null;
  setSelectItemToWrap: (item: Description) => void;
  getItemAssetByClassId: (classId: string) => Asset | undefined;
}

export const createInventorySlice: StateCreator<InventorySlice> = (
  set,
  get
) => ({
  csgoInventory: null,
  setCsgoInventory: (csgoInventory) =>
    set((state) => ({ ...state, csgoInventory })),
  openWrapModal: false,
  setOpenWrapModal: (openWrapModal) =>
    set((state) => ({ ...state, openWrapModal: openWrapModal })),
  selectItemToWrap: null,
  setSelectItemToWrap: (item) =>
    set((state) => ({ ...state, selectItemToWrap: item })),
  getItemAssetByClassId: (classId: string) => {
    const inventory = get().csgoInventory;

    const asset = inventory?.assets.find((asset) => asset.classid === classId);

    return asset;
  },
});
