import type { StateCreator } from "zustand";
import { create as _create } from "zustand";
import type { UserSlice } from "./createUserSlice";
import { createUserSlice } from "./createUserSlice";
import type { InventorySlice } from "./createInventorySlice";
import { createInventorySlice } from "./createInventorySlice";

const resetters: (() => void)[] = [];

export const create = (<T>(f: StateCreator<T> | undefined) => {
  if (f === undefined) return create;
  const store = _create(f);
  const initialState = store.getState();
  resetters.push(() => {
    store.setState(initialState, true);
  });
  return store;
}) as typeof _create;

export const resetAllStores = () => {
  for (const resetter of resetters) {
    resetter();
  }
};

export const useStore = create<UserSlice & InventorySlice>()((...a) => ({
  ...createUserSlice(...a),
  ...createInventorySlice(...a),
}));
