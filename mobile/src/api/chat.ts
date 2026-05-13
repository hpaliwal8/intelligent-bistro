import EventSource from "react-native-sse";
import type {
  Cart,
  ChatMessage,
  ChatStreamEvent,
  CartAction,
} from "../../../shared";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

export interface ChatStreamHandlers {
  onText: (delta: string) => void;
  onAction: (action: CartAction) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

export interface ChatStreamHandle {
  close: () => void;
}

/**
 * Open an SSE connection to /chat. The server sends `text`, `action`, `error`,
 * and `done` events; we dispatch each to the matching handler. The returned
 * handle lets the caller abort the stream (e.g. on screen unmount).
 *
 * Behavior:
 *   - All event payloads are JSON-encoded in `data:` lines.
 *   - On `done` we close the underlying EventSource automatically.
 *   - On transport error (HTTP non-200, network drop) we surface a single
 *     `onError` + `onDone` pair so the chat store can settle.
 */
export function streamChat(
  message: string,
  cart: Cart,
  history: ChatMessage[],
  handlers: ChatStreamHandlers
): ChatStreamHandle {
  const es = new EventSource(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, cart, history }),
    // We don't want auto-reconnect; one turn = one request.
    pollingInterval: 0,
  });

  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    es.close();
    handlers.onDone();
  };

  es.addEventListener("message", (event) => {
    if (!event.data) return;
    let parsed: ChatStreamEvent;
    try {
      parsed = JSON.parse(event.data) as ChatStreamEvent;
    } catch {
      handlers.onError("Received malformed event from server");
      settle();
      return;
    }
    switch (parsed.type) {
      case "text":
        handlers.onText(parsed.delta);
        break;
      case "action":
        handlers.onAction(parsed.action);
        break;
      case "clarification":
        handlers.onText(parsed.question);
        break;
      case "error":
        handlers.onError(parsed.message);
        break;
      case "done":
        settle();
        break;
    }
  });

  es.addEventListener("error", (event) => {
    if (settled) return;
    const message =
      "message" in event && typeof event.message === "string"
        ? event.message
        : "Connection error";
    handlers.onError(message);
    settle();
  });

  return {
    close: () => {
      if (!settled) {
        settled = true;
        es.close();
        handlers.onDone();
      }
    },
  };
}
