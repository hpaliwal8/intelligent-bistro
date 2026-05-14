import type { Cart, CartAction } from "../../../shared";
import { findItem } from "../../../shared";
import {
  AddItemInput,
  UpdateQuantityInput,
  UpdateLineInput,
  RemoveLineInput,
  ClearCartInput,
} from "./tools";

export type ValidationResult =
  | { ok: true; action: CartAction }
  | { ok: false; reason: string };

/**
 * Convert a single Claude tool-use payload into a validated CartAction.
 * Returns `{ok: false, reason}` if the tool name is unknown, the input doesn't
 * pass schema validation, or the referenced menu item / cart line doesn't exist.
 */
export function validateToolCall(
  toolName: string,
  rawInput: unknown,
  cart: Cart
): ValidationResult {
  switch (toolName) {
    case "add_item": {
      const parsed = AddItemInput.safeParse(rawInput);
      if (!parsed.success) {
        return { ok: false, reason: `add_item: ${parsed.error.message}` };
      }
      const item = findItem(parsed.data.menu_id);
      if (!item) {
        return {
          ok: false,
          reason: `add_item: unknown menu_id "${parsed.data.menu_id}"`,
        };
      }
      // Verify each modifier references a real group + option on this item.
      for (const m of parsed.data.modifiers) {
        const group = item.modifiers.find((g) => g.id === m.group_id);
        if (!group) {
          return {
            ok: false,
            reason: `add_item: unknown group_id "${m.group_id}" for item "${item.id}"`,
          };
        }
        const opt = group.options.find((o) => o.id === m.option_id);
        if (!opt) {
          return {
            ok: false,
            reason: `add_item: unknown option_id "${m.option_id}" in group "${group.id}"`,
          };
        }
      }
      // Verify every required modifier group is present.
      for (const g of item.modifiers) {
        if (g.required && !parsed.data.modifiers.some((m) => m.group_id === g.id)) {
          return {
            ok: false,
            reason: `add_item: required modifier "${g.id}" not specified for "${item.id}"`,
          };
        }
      }
      return {
        ok: true,
        action: {
          type: "add_item",
          itemId: parsed.data.menu_id,
          quantity: parsed.data.quantity,
          modifiers: parsed.data.modifiers.map((m) => ({
            groupId: m.group_id,
            optionId: m.option_id,
          })),
          notes: parsed.data.notes,
        },
      };
    }

    case "update_quantity": {
      const parsed = UpdateQuantityInput.safeParse(rawInput);
      if (!parsed.success) {
        return { ok: false, reason: `update_quantity: ${parsed.error.message}` };
      }
      const line = cart.lines.find((l) => l.lineId === parsed.data.line_id);
      if (!line) {
        return {
          ok: false,
          reason: `update_quantity: lineId "${parsed.data.line_id}" not found in cart`,
        };
      }
      if (parsed.data.quantity === 0) {
        return {
          ok: true,
          action: { type: "remove_line", lineId: parsed.data.line_id },
        };
      }
      return {
        ok: true,
        action: {
          type: "update_quantity",
          lineId: parsed.data.line_id,
          quantity: parsed.data.quantity,
        },
      };
    }

    case "update_line": {
      const parsed = UpdateLineInput.safeParse(rawInput);
      if (!parsed.success) {
        return { ok: false, reason: `update_line: ${parsed.error.message}` };
      }
      const line = cart.lines.find((l) => l.lineId === parsed.data.line_id);
      if (!line) {
        return {
          ok: false,
          reason: `update_line: lineId "${parsed.data.line_id}" not found in cart`,
        };
      }
      const item = findItem(line.itemId);
      if (!item) {
        return {
          ok: false,
          reason: `update_line: cart line references unknown item "${line.itemId}"`,
        };
      }
      // Modifier validation — same shape as add_item: every selected
      // group_id/option_id must exist on the item, and every required group
      // must be present in the new modifier set.
      for (const m of parsed.data.modifiers) {
        const group = item.modifiers.find((g) => g.id === m.group_id);
        if (!group) {
          return {
            ok: false,
            reason: `update_line: unknown group_id "${m.group_id}" for item "${item.id}"`,
          };
        }
        const opt = group.options.find((o) => o.id === m.option_id);
        if (!opt) {
          return {
            ok: false,
            reason: `update_line: unknown option_id "${m.option_id}" in group "${group.id}"`,
          };
        }
      }
      for (const g of item.modifiers) {
        if (g.required && !parsed.data.modifiers.some((m) => m.group_id === g.id)) {
          return {
            ok: false,
            reason: `update_line: required modifier "${g.id}" missing in new modifier set for "${item.id}"`,
          };
        }
      }
      return {
        ok: true,
        action: {
          type: "update_line",
          lineId: parsed.data.line_id,
          quantity: parsed.data.quantity,
          modifiers: parsed.data.modifiers.map((m) => ({
            groupId: m.group_id,
            optionId: m.option_id,
          })),
          notes: parsed.data.notes,
        },
      };
    }

    case "remove_line": {
      const parsed = RemoveLineInput.safeParse(rawInput);
      if (!parsed.success) {
        return { ok: false, reason: `remove_line: ${parsed.error.message}` };
      }
      const line = cart.lines.find((l) => l.lineId === parsed.data.line_id);
      if (!line) {
        return {
          ok: false,
          reason: `remove_line: lineId "${parsed.data.line_id}" not found in cart`,
        };
      }
      return {
        ok: true,
        action: { type: "remove_line", lineId: parsed.data.line_id },
      };
    }

    case "clear_cart": {
      const parsed = ClearCartInput.safeParse(rawInput);
      if (!parsed.success) {
        return { ok: false, reason: `clear_cart: ${parsed.error.message}` };
      }
      return { ok: true, action: { type: "clear_cart" } };
    }

    default:
      return { ok: false, reason: `Unknown tool: ${toolName}` };
  }
}
