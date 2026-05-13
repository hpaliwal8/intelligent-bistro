import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import type {
  CartLine,
  CartAction,
  SelectedModifier,
} from "../../../shared";
import { findItem } from "../../../shared";

interface CartState {
  lines: CartLine[];

  addItem: (
    itemId: string,
    quantity: number,
    modifiers: SelectedModifier[],
    notes?: string
  ) => string | null;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  applyAiAction: (action: CartAction) => string | null;
}

// Lines merge only when item, modifiers, AND notes all match. Notes-bearing
// lines are intentionally kept distinct so a "no onions" line never collapses
// into a plain one even if a later add happens to share modifiers.
function dedupeKey(itemId: string, mods: SelectedModifier[], notes?: string): string {
  const modPart = [...mods]
    .map((m) => `${m.groupId}:${m.optionId}`)
    .sort()
    .join("|");
  return `${itemId}::${modPart}::${notes ?? ""}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addItem: (itemId, quantity, modifiers, notes) => {
        const item = findItem(itemId);
        if (!item) return null;
        const key = dedupeKey(itemId, modifiers, notes);
        const existing = get().lines.find(
          (l) => dedupeKey(l.itemId, l.modifiers, l.notes) === key
        );
        if (existing) {
          set((s) => ({
            lines: s.lines.map((l) =>
              l.lineId === existing.lineId
                ? { ...l, quantity: l.quantity + quantity }
                : l
            ),
          }));
          return existing.lineId;
        }
        const lineId = String(uuid.v4());
        set((s) => ({
          lines: [...s.lines, { lineId, itemId, quantity, modifiers, notes }],
        }));
        return lineId;
      },

      updateQuantity: (lineId, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.lineId !== lineId)
              : s.lines.map((l) =>
                  l.lineId === lineId ? { ...l, quantity } : l
                ),
        })),

      removeLine: (lineId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) })),

      clear: () => set({ lines: [] }),

      applyAiAction: (action) => {
        switch (action.type) {
          case "add_item":
            return get().addItem(
              action.itemId,
              action.quantity,
              action.modifiers,
              action.notes
            );
          case "update_quantity":
            get().updateQuantity(action.lineId, action.quantity);
            return action.lineId;
          case "remove_line":
            get().removeLine(action.lineId);
            return action.lineId;
          case "clear_cart":
            get().clear();
            return null;
          default: {
            const _exhaustive: never = action;
            return _exhaustive;
          }
        }
      },
    }),
    {
      name: "bistro-cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ lines: s.lines }),
      version: 1,
      // Drop any persisted lines that no longer reference a known menu item.
      // This protects users on app updates where item IDs change between versions.
      migrate: (persisted: unknown, _version) => {
        const state = (persisted ?? {}) as Partial<{ lines: CartLine[] }>;
        const lines = (state.lines ?? []).filter((l) => findItem(l.itemId));
        return { lines } as Partial<CartState>;
      },
    }
  )
);
