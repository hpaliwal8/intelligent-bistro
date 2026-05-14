import Anthropic from "@anthropic-ai/sdk";
import type { Cart, ChatRequest, ChatStreamEvent } from "../../../shared";
import { findItem } from "../../../shared";
import { buildSystemPrompt } from "./systemPrompt";
import { TOOLS } from "./tools";
import { validateToolCall } from "./validateAction";

/**
 * One-line cart digest used as an inline reminder on the user's last message.
 * The system prompt's cart section is authoritative in theory, but the model
 * leans heavily on conversation history. Injecting the live cart state into
 * the most-attended-to position (the latest user turn) consistently overrides
 * that bias. The customer never sees this text — it's only in the request body
 * sent to Anthropic, not echoed to the client.
 */
function cartDigest(cart: Cart): string {
  if (cart.lines.length === 0) return "(cart is empty)";
  return cart.lines
    .map((l) => {
      const item = findItem(l.itemId);
      const name = item?.name ?? l.itemId;
      const mods = l.modifiers
        .map((m) => {
          const g = item?.modifiers.find((mg) => mg.id === m.groupId);
          const o = g?.options.find((opt) => opt.id === m.optionId);
          return o?.label ?? m.optionId;
        })
        .filter(Boolean)
        .join(", ");
      return `${l.quantity}× ${name}${mods ? ` (${mods})` : ""}`;
    })
    .join("; ");
}

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

// Lazy singleton — avoid constructing the client at import time so missing-key
// errors surface on the first request, not on server boot.
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/**
 * Stream a single conversational turn from Claude.
 *
 * Emits SSE events in stream order:
 *   - `text` deltas as Claude generates the assistant reply
 *   - `action` events when a tool call is validated against the menu/cart
 *   - `error` events for tool calls that fail validation (logged server-side too)
 *
 * The caller (chat.ts route) is responsible for emitting the final `done` event.
 */
export async function runChat(
  req: ChatRequest,
  emit: (event: ChatStreamEvent) => Promise<void>,
  signal?: AbortSignal
): Promise<void> {
  const client = getClient();

  // Inject a hidden cart-state preamble into the latest user message. The
  // customer's actual words are clearly delimited so the model still treats
  // the rest of the turn as their input. This beats history-based hallucination.
  const augmentedUserContent = `[Live cart snapshot (authoritative — overrides any earlier turns): ${cartDigest(
    req.cart
  )}]

User says: ${req.message}`;

  const messages: Anthropic.Messages.MessageParam[] = [
    ...req.history.map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: augmentedUserContent },
  ];

  const stream = client.messages.stream(
    {
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(req.cart),
      tools: TOOLS,
      messages,
    },
    signal ? { signal } : undefined
  );

  // Accumulate tool-use blocks across their input_json_delta events.
  type PendingToolUse = { name: string; inputJson: string };
  const pendingByIndex = new Map<number, PendingToolUse>();

  for await (const event of stream) {
    switch (event.type) {
      case "content_block_start": {
        const block = event.content_block;
        if (block.type === "tool_use") {
          pendingByIndex.set(event.index, {
            name: block.name,
            inputJson: "",
          });
        }
        break;
      }

      case "content_block_delta": {
        const delta = event.delta;
        if (delta.type === "text_delta") {
          await emit({ type: "text", delta: delta.text });
        } else if (delta.type === "input_json_delta") {
          const pending = pendingByIndex.get(event.index);
          if (pending) pending.inputJson += delta.partial_json;
        }
        break;
      }

      case "content_block_stop": {
        const pending = pendingByIndex.get(event.index);
        if (!pending) break;
        pendingByIndex.delete(event.index);

        let parsedInput: unknown;
        try {
          parsedInput = pending.inputJson.length > 0
            ? JSON.parse(pending.inputJson)
            : {};
        } catch (err) {
          const reason = err instanceof Error ? err.message : "invalid JSON";
          console.warn(`[chat] tool ${pending.name} input not parseable:`, reason);
          await emit({ type: "error", message: `Tool input invalid: ${reason}` });
          break;
        }

        const result = validateToolCall(pending.name, parsedInput, req.cart);
        if (!result.ok) {
          console.warn(`[chat] tool ${pending.name} rejected:`, result.reason);
          await emit({ type: "error", message: result.reason });
          break;
        }
        await emit({ type: "action", action: result.action });
        break;
      }

      // No-op: message_start, message_delta, message_stop carry no client-visible info.
      default:
        break;
    }
  }
}
