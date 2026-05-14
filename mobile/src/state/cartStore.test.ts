import { beforeEach, describe, expect, it } from "vitest";
import { useCart } from "./cartStore";
import type { CartAction } from "../../../shared";

function reset() {
  useCart.setState({
    lines: [],
    lastAiTouched: { lineId: null, nonce: 0 },
  });
}

const SPICY = "spicy-chicken-sandwich"; // has required `spice` modifier in menu
const BURGER = "smash-burger"; // no required modifiers
const LATTE = "iced-latte"; // size required, milk/ice optional

describe("cartStore", () => {
  beforeEach(reset);

  describe("addItem", () => {
    it("adds a new line and returns its lineId", () => {
      const id = useCart.getState().addItem(BURGER, 1, []);
      expect(id).not.toBeNull();
      expect(useCart.getState().lines).toHaveLength(1);
      expect(useCart.getState().lines[0]?.itemId).toBe(BURGER);
      expect(useCart.getState().lines[0]?.quantity).toBe(1);
    });

    it("returns null for unknown menu IDs (validation guard)", () => {
      const id = useCart.getState().addItem("nonexistent-item", 1, []);
      expect(id).toBeNull();
      expect(useCart.getState().lines).toHaveLength(0);
    });

    it("merges identical add_item calls into one line with summed quantity", () => {
      const id1 = useCart.getState().addItem(BURGER, 1, []);
      const id2 = useCart.getState().addItem(BURGER, 2, []);
      expect(id1).toBe(id2);
      expect(useCart.getState().lines).toHaveLength(1);
      expect(useCart.getState().lines[0]?.quantity).toBe(3);
    });

    it("keeps separate lines when modifiers differ", () => {
      useCart.getState().addItem(SPICY, 1, [
        { groupId: "spice", optionId: "mild" },
      ]);
      useCart.getState().addItem(SPICY, 1, [
        { groupId: "spice", optionId: "spicy" },
      ]);
      expect(useCart.getState().lines).toHaveLength(2);
    });

    it("keeps separate lines when notes differ (even if items/modifiers match)", () => {
      useCart.getState().addItem(BURGER, 1, [], "no onions");
      useCart.getState().addItem(BURGER, 1, []);
      expect(useCart.getState().lines).toHaveLength(2);
    });
  });

  describe("updateQuantity", () => {
    it("changes the quantity of an existing line", () => {
      const id = useCart.getState().addItem(BURGER, 1, [])!;
      useCart.getState().updateQuantity(id, 5);
      expect(useCart.getState().lines[0]?.quantity).toBe(5);
    });

    it("removes the line when quantity goes to 0", () => {
      const id = useCart.getState().addItem(BURGER, 1, [])!;
      useCart.getState().updateQuantity(id, 0);
      expect(useCart.getState().lines).toHaveLength(0);
    });

    it("is a no-op for unknown lineId (no crash, no insertion)", () => {
      useCart.getState().addItem(BURGER, 1, []);
      useCart.getState().updateQuantity("does-not-exist", 3);
      expect(useCart.getState().lines).toHaveLength(1);
      expect(useCart.getState().lines[0]?.quantity).toBe(1);
    });
  });

  describe("removeLine + clear", () => {
    it("removes a specific line", () => {
      const id1 = useCart.getState().addItem(BURGER, 1, [])!;
      useCart.getState().addItem(LATTE, 1, [
        { groupId: "size", optionId: "small" },
      ]);
      useCart.getState().removeLine(id1);
      expect(useCart.getState().lines).toHaveLength(1);
      expect(useCart.getState().lines[0]?.itemId).toBe(LATTE);
    });

    it("clear() empties the cart", () => {
      useCart.getState().addItem(BURGER, 2, []);
      useCart.getState().clear();
      expect(useCart.getState().lines).toHaveLength(0);
    });
  });

  describe("applyAiAction", () => {
    it("dispatches add_item and bumps lastAiTouched nonce", () => {
      const beforeNonce = useCart.getState().lastAiTouched.nonce;
      const action: CartAction = {
        type: "add_item",
        itemId: BURGER,
        quantity: 2,
        modifiers: [],
      };
      const lineId = useCart.getState().applyAiAction(action);
      expect(lineId).not.toBeNull();
      expect(useCart.getState().lines).toHaveLength(1);
      expect(useCart.getState().lines[0]?.quantity).toBe(2);
      expect(useCart.getState().lastAiTouched.lineId).toBe(lineId);
      expect(useCart.getState().lastAiTouched.nonce).toBe(beforeNonce + 1);
    });

    it("bumps nonce even when the same line is touched twice in a row", () => {
      const lineId = useCart.getState().addItem(BURGER, 1, [])!;
      const before = useCart.getState().lastAiTouched.nonce;
      useCart
        .getState()
        .applyAiAction({ type: "update_quantity", lineId, quantity: 3 });
      const mid = useCart.getState().lastAiTouched.nonce;
      useCart
        .getState()
        .applyAiAction({ type: "update_quantity", lineId, quantity: 4 });
      const after = useCart.getState().lastAiTouched.nonce;
      expect(mid).toBe(before + 1);
      expect(after).toBe(mid + 1);
    });

    it("dispatches remove_line", () => {
      const lineId = useCart.getState().addItem(BURGER, 1, [])!;
      useCart.getState().applyAiAction({ type: "remove_line", lineId });
      expect(useCart.getState().lines).toHaveLength(0);
    });

    it("dispatches update_line (replaces modifiers + quantity, preserves lineId)", () => {
      const lineId = useCart.getState().addItem(LATTE, 1, [
        { groupId: "size", optionId: "small" },
        { groupId: "milk", optionId: "whole" },
      ])!;
      const action: CartAction = {
        type: "update_line",
        lineId,
        quantity: 2,
        modifiers: [
          { groupId: "size", optionId: "large" },
          { groupId: "milk", optionId: "oat" },
        ],
      };
      const returned = useCart.getState().applyAiAction(action);
      expect(returned).toBe(lineId);
      const line = useCart.getState().lines[0];
      expect(line?.lineId).toBe(lineId); // lineId preserved
      expect(line?.quantity).toBe(2);
      expect(line?.modifiers).toContainEqual({
        groupId: "size",
        optionId: "large",
      });
      expect(line?.modifiers).toContainEqual({
        groupId: "milk",
        optionId: "oat",
      });
      expect(useCart.getState().lastAiTouched.lineId).toBe(lineId);
    });

    it("update_line with quantity 0 removes the line (defensive guard)", () => {
      const lineId = useCart.getState().addItem(BURGER, 1, [])!;
      useCart.getState().updateLine(lineId, { modifiers: [], quantity: 0 });
      expect(useCart.getState().lines).toHaveLength(0);
    });

    it("dispatches clear_cart", () => {
      useCart.getState().addItem(BURGER, 1, []);
      useCart.getState().addItem(LATTE, 1, [
        { groupId: "size", optionId: "small" },
      ]);
      useCart.getState().applyAiAction({ type: "clear_cart" });
      expect(useCart.getState().lines).toHaveLength(0);
      expect(useCart.getState().lastAiTouched.lineId).toBeNull();
    });
  });
});
