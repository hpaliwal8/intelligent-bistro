import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";

// ─── Zod input schemas (runtime validation of Claude's tool calls) ──────────

export const AddItemInput = z.object({
  menu_id: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  modifiers: z
    .array(
      z.object({
        group_id: z.string(),
        option_id: z.string(),
      })
    )
    .default([]),
  notes: z.string().max(200).optional(),
});

export const UpdateQuantityInput = z.object({
  line_id: z.string().min(1),
  quantity: z.number().int().min(0).max(20),
});

export const UpdateLineInput = z.object({
  line_id: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  modifiers: z
    .array(
      z.object({
        group_id: z.string(),
        option_id: z.string(),
      })
    )
    .default([]),
  notes: z.string().max(200).optional(),
});

export const RemoveLineInput = z.object({
  line_id: z.string().min(1),
});

export const ClearCartInput = z.object({}).strict();

export type AddItemArgs = z.infer<typeof AddItemInput>;
export type UpdateQuantityArgs = z.infer<typeof UpdateQuantityInput>;
export type UpdateLineArgs = z.infer<typeof UpdateLineInput>;
export type RemoveLineArgs = z.infer<typeof RemoveLineInput>;

// ─── Anthropic tool definitions ─────────────────────────────────────────────

export const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "add_item",
    description:
      "Add one or more units of a menu item to the customer's cart. Use the exact `menu_id` from the menu in the system prompt. Include modifiers using the `group_id` / `option_id` pairs shown in the menu. If a modifier group is required but the user didn't specify one, ASK FIRST instead of guessing.",
    input_schema: {
      type: "object",
      properties: {
        menu_id: {
          type: "string",
          description: "The exact id of the menu item (e.g. 'spicy-chicken-sandwich').",
        },
        quantity: {
          type: "integer",
          description: "How many units to add.",
          minimum: 1,
          maximum: 20,
        },
        modifiers: {
          type: "array",
          description:
            "Selected modifier options. Each entry references one option within one modifier group of the item.",
          items: {
            type: "object",
            properties: {
              group_id: { type: "string" },
              option_id: { type: "string" },
            },
            required: ["group_id", "option_id"],
          },
        },
        notes: {
          type: "string",
          description:
            "Optional customer note for this line (e.g. 'no onions'). Keep brief — max 200 chars.",
        },
      },
      required: ["menu_id", "quantity"],
    },
  },
  {
    name: "update_quantity",
    description:
      "Change ONLY the quantity of an existing cart line, keeping all modifiers and notes the same. Use this when the customer says things like 'make it three' or 'two of these'. Setting quantity to 0 removes the line. If the customer wants to change modifiers (size, milk, spice level, etc.), use `update_line` instead — NOT remove + add.",
    input_schema: {
      type: "object",
      properties: {
        line_id: {
          type: "string",
          description:
            "The `lineId` of an existing cart line (shown in the current cart in the system prompt).",
        },
        quantity: {
          type: "integer",
          minimum: 0,
          maximum: 20,
        },
      },
      required: ["line_id", "quantity"],
    },
  },
  {
    name: "update_line",
    description:
      "**USE THIS FOR ANY MODIFIER OR QUANTITY CHANGE TO AN EXISTING CART LINE.** Replaces the line's modifiers, quantity, and notes atomically while preserving the lineId. Examples that should use update_line: 'change my latte to large', 'make it oat milk instead', 'make the burger extra spicy', 'add a note: no onions', 'change my chicken sandwich from mild to spicy'. CRITICAL: when changing modifiers, you MUST emit ONLY a single update_line tool call — do NOT also emit remove_line, and do NOT emit add_item. The single update_line call replaces everything about the line. Read the current cart in the system prompt to see existing modifiers, then construct the COMPLETE new modifier set (keep unchanged groups, swap changed groups). Every required modifier group for the item must still be present. **Preserve `notes`**: if the line already has a note (shown as note:\"…\" in the cart), pass that same note in this call unless the customer explicitly asks to change or remove it — omitting `notes` will clear the existing note.",
    input_schema: {
      type: "object",
      properties: {
        line_id: {
          type: "string",
          description: "The `lineId` of the existing cart line to update.",
        },
        quantity: {
          type: "integer",
          description:
            "The new quantity. Must be at least 1 — use `remove_line` to delete.",
          minimum: 1,
          maximum: 20,
        },
        modifiers: {
          type: "array",
          description:
            "The complete desired modifier set after this update. Includes both changed and unchanged selections.",
          items: {
            type: "object",
            properties: {
              group_id: { type: "string" },
              option_id: { type: "string" },
            },
            required: ["group_id", "option_id"],
          },
        },
        notes: {
          type: "string",
          description: "Optional customer note (e.g. 'extra crispy').",
        },
      },
      required: ["line_id", "quantity", "modifiers"],
    },
  },
  {
    name: "remove_line",
    description:
      "Delete a line from the cart ENTIRELY. Use ONLY when the customer wants to fully discard an item ('take the burger off', 'never mind the latte', 'drop the salad'). DO NOT use this as part of a modifier change — if the customer wants to *change* something about an existing item (size, milk, spice, notes, etc.), use `update_line` instead. Mistake to avoid: calling remove_line+add_item to update modifiers leaves the customer with a flickering empty cart and breaks the lineId continuity.",
    input_schema: {
      type: "object",
      properties: {
        line_id: { type: "string" },
      },
      required: ["line_id"],
    },
  },
  {
    name: "clear_cart",
    description:
      "Empty the entire cart. Only use when the customer explicitly asks to start over.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
];
