import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import type {
  Cart,
  CartLine,
  CartAction,
  SelectedModifier,
} from "../shared/types";
import { findItem } from "../shared/types";

interface CartState {
  lines: CartLine[];
  // Animated "recently changed" line IDs for UI highlights.
  recentlyChanged: Set<string>;

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
  clearRecent: () => void;
  getCart: () => Cart;
}

function modsKey(mods: SelectedModifier[]): string {
  return [...mods]
    .map((m) => `${m.groupId}:${m.optionId}`)
    .sort()
    .join("|");
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      recentlyChanged: new Set<string>(),

      addItem: (itemId, quantity, modifiers, notes) => {
        const item = findItem(itemId);
        if (!item) return null;
        const key = modsKey(modifiers);
        const existing = get().lines.find(
          (l) =>
            l.itemId === itemId && modsKey(l.modifiers) === key && !l.notes && !notes
        );
        if (existing) {
          const updated = { ...existing, quantity: existing.quantity + quantity };
          set((s) => ({
            lines: s.lines.map((l) => (l.lineId === existing.lineId ? updated : l)),
            recentlyChanged: new Set(s.recentlyChanged).add(existing.lineId),
          }));
          return existing.lineId;
        }
        const lineId = String(uuid.v4());
        const newLine: CartLine = {
          lineId,
          itemId,
          quantity,
          modifiers,
          notes,
        };
        set((s) => ({
          lines: [...s.lines, newLine],
          recentlyChanged: new Set(s.recentlyChanged).add(lineId),
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
          recentlyChanged: new Set(s.recentlyChanged).add(lineId),
        })),

      removeLine: (lineId) =>
        set((s) => ({
          lines: s.lines.filter((l) => l.lineId !== lineId),
        })),

      clear: () => set({ lines: [], recentlyChanged: new Set() }),

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
        }
      },

      clearRecent: () => set({ recentlyChanged: new Set() }),

      getCart: () => ({ lines: get().lines }),
    }),
    {
      name: "bistro-cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ lines: s.lines }),
    }
  )
);
