// Day 3 plumbing verification. Exercises tools, validator, and system prompt
// without making a real Anthropic API call.
//
// Run: `npx tsx scripts/test-ai-plumbing.ts` from the server/ directory.

import { TOOLS } from "../src/ai/tools";
import { validateToolCall } from "../src/ai/validateAction";
import { buildSystemPrompt } from "../src/ai/systemPrompt";
import type { Cart, CartLine } from "../../shared";

let passed = 0;
let failed = 0;

function check(label: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const emptyCart: Cart = { lines: [] };

const cartWithBurger: Cart = {
  lines: [
    {
      lineId: "line-abc",
      itemId: "smash-burger",
      quantity: 1,
      modifiers: [],
    } as CartLine,
  ],
};

console.log("── Tool definitions ──");
check("5 tools defined", TOOLS.length === 5);
check(
  "all tools have name + description + input_schema",
  TOOLS.every((t) => t.name && t.description && t.input_schema)
);
const toolNames = TOOLS.map((t) => t.name).sort();
check(
  "tools are add_item, clear_cart, remove_line, update_line, update_quantity",
  JSON.stringify(toolNames) ===
    JSON.stringify([
      "add_item",
      "clear_cart",
      "remove_line",
      "update_line",
      "update_quantity",
    ]),
  `got: ${toolNames.join(", ")}`
);

console.log("\n── System prompt ──");
const promptEmpty = buildSystemPrompt(emptyCart);
check("includes menu section", promptEmpty.includes("## The menu"));
check(
  "includes mains heading",
  promptEmpty.includes("### MAINS")
);
check(
  "inlines spicy-chicken-sandwich",
  promptEmpty.includes('id="spicy-chicken-sandwich"')
);
check(
  "inlines spice modifier group",
  promptEmpty.includes('modifier "spice"')
);
check("empty cart shows (empty)", promptEmpty.includes("(empty)"));

const promptWithCart = buildSystemPrompt(cartWithBurger);
check(
  "populated cart includes lineId",
  promptWithCart.includes('lineId="line-abc"')
);
check(
  "populated cart includes item name",
  promptWithCart.includes("Double Smash Burger")
);

console.log("\n── Validator: valid calls ──");

const v1 = validateToolCall(
  "add_item",
  { menu_id: "smash-burger", quantity: 2, modifiers: [] },
  emptyCart
);
check(
  "add_item with no modifiers (smash-burger has no required mods)",
  v1.ok && v1.action.type === "add_item" && v1.action.quantity === 2
);

const v2 = validateToolCall(
  "add_item",
  {
    menu_id: "spicy-chicken-sandwich",
    quantity: 1,
    modifiers: [{ group_id: "spice", option_id: "spicy" }],
  },
  emptyCart
);
check(
  "add_item with required modifier present",
  v2.ok &&
    v2.action.type === "add_item" &&
    v2.action.modifiers[0]?.groupId === "spice" &&
    v2.action.modifiers[0]?.optionId === "spicy"
);

const v3 = validateToolCall(
  "update_quantity",
  { line_id: "line-abc", quantity: 3 },
  cartWithBurger
);
check(
  "update_quantity → update_quantity action",
  v3.ok && v3.action.type === "update_quantity" && v3.action.quantity === 3
);

const v4 = validateToolCall(
  "update_quantity",
  { line_id: "line-abc", quantity: 0 },
  cartWithBurger
);
check(
  "update_quantity to 0 collapses to remove_line",
  v4.ok && v4.action.type === "remove_line"
);

const v5 = validateToolCall("clear_cart", {}, cartWithBurger);
check("clear_cart accepted", v5.ok && v5.action.type === "clear_cart");

// Build a cart containing a latte (size required) so we can exercise
// update_line modifier-replacement paths.
const latteLine: CartLine = {
  lineId: "line-latte",
  itemId: "iced-latte",
  quantity: 1,
  modifiers: [
    { groupId: "size", optionId: "small" },
    { groupId: "milk", optionId: "whole" },
  ],
};
const cartWithLatte: Cart = { lines: [latteLine] };

const v6 = validateToolCall(
  "update_line",
  {
    line_id: "line-latte",
    quantity: 1,
    modifiers: [
      { group_id: "size", option_id: "large" },
      { group_id: "milk", option_id: "oat" },
    ],
  },
  cartWithLatte
);
check(
  "update_line replaces modifiers in place",
  v6.ok &&
    v6.action.type === "update_line" &&
    v6.action.lineId === "line-latte" &&
    v6.action.modifiers.some(
      (m) => m.groupId === "size" && m.optionId === "large"
    ) &&
    v6.action.modifiers.some(
      (m) => m.groupId === "milk" && m.optionId === "oat"
    )
);

console.log("\n── Validator: rejections ──");

const r1 = validateToolCall(
  "add_item",
  { menu_id: "pizza-margherita", quantity: 1, modifiers: [] },
  emptyCart
);
check(
  "rejects unknown menu_id",
  !r1.ok && r1.reason.includes("unknown menu_id")
);

const r2 = validateToolCall(
  "add_item",
  { menu_id: "spicy-chicken-sandwich", quantity: 1, modifiers: [] },
  emptyCart
);
check(
  "rejects missing required modifier",
  !r2.ok && r2.reason.includes("required modifier")
);

const r3 = validateToolCall(
  "add_item",
  {
    menu_id: "spicy-chicken-sandwich",
    quantity: 1,
    modifiers: [{ group_id: "spice", option_id: "nuclear" }],
  },
  emptyCart
);
check(
  "rejects unknown option_id",
  !r3.ok && r3.reason.includes("unknown option_id")
);

const r4 = validateToolCall(
  "update_quantity",
  { line_id: "does-not-exist", quantity: 1 },
  cartWithBurger
);
check(
  "rejects update_quantity for unknown lineId",
  !r4.ok && r4.reason.includes("not found")
);

const r5 = validateToolCall(
  "add_item",
  { menu_id: "smash-burger", quantity: 999 },
  emptyCart
);
check(
  "rejects quantity over schema max",
  !r5.ok && r5.reason.includes("add_item")
);

const r6 = validateToolCall("nonexistent_tool", {}, emptyCart);
check("rejects unknown tool name", !r6.ok && r6.reason.includes("Unknown tool"));

const r7 = validateToolCall(
  "update_line",
  { line_id: "line-latte", quantity: 1, modifiers: [] },
  cartWithLatte
);
check(
  "rejects update_line that drops required modifier (size)",
  !r7.ok && r7.reason.includes("required modifier")
);

const r8 = validateToolCall(
  "update_line",
  {
    line_id: "missing",
    quantity: 1,
    modifiers: [{ group_id: "size", option_id: "small" }],
  },
  cartWithLatte
);
check(
  "rejects update_line for unknown lineId",
  !r8.ok && r8.reason.includes("not found")
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
