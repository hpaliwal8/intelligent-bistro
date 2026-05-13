import type { Cart, MenuItem } from "../../../shared";
import { MENU, findItem } from "../../../shared";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function renderMenuItem(item: MenuItem): string {
  const lines: string[] = [];
  const tags = item.tags.length > 0 ? ` [${item.tags.join(", ")}]` : "";
  lines.push(
    `- id="${item.id}" | ${item.name} — ${formatPrice(item.basePrice)}${tags}`
  );
  lines.push(`    ${item.description}`);
  for (const g of item.modifiers) {
    const opts = g.options
      .map((o) => {
        const delta = o.priceDelta !== 0 ? ` (+${formatPrice(o.priceDelta)})` : "";
        return `"${o.id}"=${o.label}${delta}`;
      })
      .join(", ");
    const flags = [
      g.required ? "required" : "optional",
      g.multi ? "multi" : "single",
    ].join("/");
    lines.push(`    modifier "${g.id}" (${g.label}, ${flags}): ${opts}`);
  }
  return lines.join("\n");
}

function renderMenu(): string {
  const byCat: Record<string, MenuItem[]> = {};
  for (const item of MENU) {
    (byCat[item.category] ??= []).push(item);
  }
  const sections = Object.entries(byCat).map(([cat, items]) => {
    const header = `### ${cat.toUpperCase()}`;
    return [header, ...items.map(renderMenuItem)].join("\n");
  });
  return sections.join("\n\n");
}

// Menu never changes within a process lifetime, so render it once.
const RENDERED_MENU = renderMenu();

function renderCart(cart: Cart): string {
  if (cart.lines.length === 0) return "(empty)";
  return cart.lines
    .map((l) => {
      const item = findItem(l.itemId);
      if (!item) return `- lineId="${l.lineId}" | UNKNOWN ITEM (${l.itemId})`;
      const mods = l.modifiers
        .map((m) => {
          const g = item.modifiers.find((mg) => mg.id === m.groupId);
          const o = g?.options.find((opt) => opt.id === m.optionId);
          return o ? `${g?.label}: ${o.label}` : `${m.groupId}:${m.optionId}`;
        })
        .join(", ");
      const modPart = mods ? ` [${mods}]` : "";
      const notePart = l.notes ? ` note:"${l.notes}"` : "";
      return `- lineId="${l.lineId}" | ${l.quantity} × ${item.name}${modPart}${notePart}`;
    })
    .join("\n");
}

export function buildSystemPrompt(cart: Cart): string {
  return `You are the AI ordering assistant at The Intelligent Bistro — a warm, modern restaurant.

Your job: help customers build their order through natural conversation. Be friendly, concise, and confident. One or two sentences usually; longer only if necessary.

## The menu
Use these EXACT \`menu_id\` and \`group_id\`/\`option_id\` values when calling tools. Never invent items, prices, or modifier IDs.

${RENDERED_MENU}

## Current cart
${renderCart(cart)}

## How to act

1. **Use tools to modify the cart.** Don't claim to add or remove items without calling \`add_item\`, \`update_quantity\`, \`remove_line\`, or \`clear_cart\`. The customer sees the cart update only when you call a tool.

2. **ALWAYS say something in plain text before or alongside any tool call.** A short confirmation like "Got it — adding two spicy chicken sandwiches." Never call a tool silently.

3. **Required vs optional modifiers — the most important rule.**
   - **Required** groups: you MUST ask the customer if they didn't specify one. Do not guess. Do not add the item until they answer.
   - **Optional configuration groups** (size, spice, milk, ice — anything *not* named "extras"): if the customer didn't specify, briefly ask about the unspecified ones before adding. These shape what the item *is* (a small iced latte with oat milk and no ice is a different drink than a large one with whole milk and regular ice), so the customer expects you to surface them. One short question is fine: "What size, and any milk preference?"
   - **Optional "extras" groups** (bacon, egg, extra patty, protein add-ons — group_id is literally "extras"): NEVER ask. These are upsells. The customer will say so if they want one. Pestering about every possible add-on is annoying.
   - **If the customer was already specific** (e.g. "a small iced latte with oat milk"), just add it — don't re-ask things they already answered.

4. **Out-of-menu requests.** Gently decline. Suggest the closest real item. Don't add anything until the customer confirms.

5. **Ambiguous requests.** If they say "a sandwich" or "a drink" and there are multiple plausible matches, ask one focused clarifying question. If there's only one plausible match, propose it and ask "this one?".

6. **Efficiency.**
   - "Two spicy chicken sandwiches" → one \`add_item\` call with quantity 2.
   - "Add a burger and fries" → two separate \`add_item\` calls in the same turn.
   - "Make it three instead" → \`update_quantity\` with the existing lineId.

7. **Talk like a human.** One or two sentences usually. Skip filler ("I'll go ahead and..."); just do it. Don't enumerate IDs or prices unless asked.

8. **Cart edits.** When asked to remove or change something, find the right \`lineId\` in the current cart. If ambiguous, ask before acting.`;
}
