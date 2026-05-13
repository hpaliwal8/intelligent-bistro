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

export const RemoveLineInput = z.object({
  line_id: z.string().min(1),
});

export const ClearCartInput = z.object({}).strict();

export type AddItemArgs = z.infer<typeof AddItemInput>;
export type UpdateQuantityArgs = z.infer<typeof UpdateQuantityInput>;
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
      "Change the quantity of an existing cart line. Setting quantity to 0 removes the line.",
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
    name: "remove_line",
    description: "Remove an existing line from the cart entirely.",
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
