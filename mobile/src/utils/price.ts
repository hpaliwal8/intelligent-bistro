import type { CartLine, MenuItem, SelectedModifier } from "../../../shared";
import { findItem } from "../../../shared";

export function modifierDelta(
  item: MenuItem,
  modifiers: SelectedModifier[]
): number {
  let delta = 0;
  for (const sel of modifiers) {
    const group = item.modifiers.find((g) => g.id === sel.groupId);
    if (!group) continue;
    const opt = group.options.find((o) => o.id === sel.optionId);
    if (opt) delta += opt.priceDelta;
  }
  return delta;
}

export function unitPrice(item: MenuItem, modifiers: SelectedModifier[]): number {
  return item.basePrice + modifierDelta(item, modifiers);
}

export function linePrice(line: CartLine): number {
  const item = findItem(line.itemId);
  if (!item) return 0;
  return unitPrice(item, line.modifiers) * line.quantity;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((acc, l) => acc + linePrice(l), 0);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Display-only sales tax for the cart summary. Not a real tax calculation —
// real fulfillment would compute this server-side based on jurisdiction.
export const DISPLAY_TAX_RATE = 0.0875;

export function cartTax(subtotal: number): number {
  return Math.round(subtotal * DISPLAY_TAX_RATE);
}

export function cartTotal(lines: CartLine[]): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = cartSubtotal(lines);
  const tax = cartTax(subtotal);
  return { subtotal, tax, total: subtotal + tax };
}
