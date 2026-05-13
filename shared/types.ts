// Shared types between mobile and server.
// Copy this file into mobile/src/shared and server/src/shared as part of the build,
// or import directly if both projects can resolve `../shared` paths.

export type Category = "mains" | "sides" | "drinks" | "desserts";

export type ModifierGroupId = "size" | "spice" | "extras" | "ice" | "milk";

export interface ModifierOption {
  id: string;
  label: string;
  priceDelta: number; // cents
}

export interface ModifierGroup {
  id: ModifierGroupId;
  label: string;
  required: boolean;
  multi: boolean; // can pick multiple
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  basePrice: number; // cents
  image: string; // remote URL
  tags: string[]; // e.g. "spicy", "vegan", "popular"
  modifiers: ModifierGroup[];
}

// `groupId` is a plain string here (not the literal `ModifierGroupId` union)
// because selections originate from user / AI input and only need to match a
// known group at validation time, not at the type level.
export interface SelectedModifier {
  groupId: string;
  optionId: string;
}

export interface CartLine {
  lineId: string; // client-generated UUID
  itemId: string;
  quantity: number;
  modifiers: SelectedModifier[];
  notes?: string;
}

export interface Cart {
  lines: CartLine[];
}

// ───────────────────────────────────────────────────────────
// Chat protocol
// ───────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  cart: Cart;
  history: ChatMessage[];
}

// Actions returned by the AI for the client to apply to the cart.
export type CartAction =
  | {
      type: "add_item";
      itemId: string;
      quantity: number;
      modifiers: SelectedModifier[];
      notes?: string;
    }
  | { type: "update_quantity"; lineId: string; quantity: number }
  | { type: "remove_line"; lineId: string }
  | { type: "clear_cart" };

// SSE event payloads sent by /chat
export type ChatStreamEvent =
  | { type: "text"; delta: string }
  | { type: "action"; action: CartAction }
  | { type: "clarification"; question: string }
  | { type: "error"; message: string }
  | { type: "done" };
