import { create } from "zustand";
import uuid from "react-native-uuid";
import type { CartAction, ChatMessage } from "../../../shared";
import { streamChat, type ChatStreamHandle } from "../api/chat";
import { useCart } from "./cartStore";

export type TurnStatus = "streaming" | "complete" | "error";

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions: CartAction[]; // assistant turns only
  status: TurnStatus;
  errorMessage?: string;
}

interface ChatState {
  turns: ChatTurn[];
  inflight: boolean;
  send: (message: string) => void;
  abort: () => void;
  reset: () => void;
}

let activeStream: ChatStreamHandle | null = null;

function asMessages(turns: ChatTurn[]): ChatMessage[] {
  // Only forward fully-complete turns to the server; in-flight assistant text
  // shouldn't be echoed back as its own context.
  return turns
    .filter((t) => t.status !== "error" && t.text.trim().length > 0)
    .map((t) => ({ role: t.role, content: t.text }));
}

export const useChat = create<ChatState>((set, get) => ({
  turns: [],
  inflight: false,

  send: (message) => {
    if (get().inflight) return;
    const trimmed = message.trim();
    if (!trimmed) return;

    const userTurn: ChatTurn = {
      id: String(uuid.v4()),
      role: "user",
      text: trimmed,
      actions: [],
      status: "complete",
    };
    const assistantTurn: ChatTurn = {
      id: String(uuid.v4()),
      role: "assistant",
      text: "",
      actions: [],
      status: "streaming",
    };

    set((s) => ({
      turns: [...s.turns, userTurn, assistantTurn],
      inflight: true,
    }));

    const cart = { lines: useCart.getState().lines };
    // History is *prior* turns only. The server appends `req.message` itself,
    // so we must exclude both the just-added userTurn AND the streaming
    // assistantTurn from history to avoid sending the user message twice.
    const history = asMessages(get().turns.slice(0, -2));

    activeStream = streamChat(trimmed, cart, history, {
      onText: (delta) => {
        set((s) => ({
          turns: s.turns.map((t) =>
            t.id === assistantTurn.id ? { ...t, text: t.text + delta } : t
          ),
        }));
      },
      onAction: (action) => {
        useCart.getState().applyAiAction(action);
        set((s) => ({
          turns: s.turns.map((t) =>
            t.id === assistantTurn.id
              ? { ...t, actions: [...t.actions, action] }
              : t
          ),
        }));
      },
      onError: (errorMessage) => {
        set((s) => ({
          turns: s.turns.map((t) =>
            t.id === assistantTurn.id
              ? { ...t, status: "error", errorMessage }
              : t
          ),
        }));
      },
      onDone: () => {
        activeStream = null;
        set((s) => ({
          inflight: false,
          turns: s.turns.map((t) =>
            t.id === assistantTurn.id && t.status === "streaming"
              ? { ...t, status: "complete" }
              : t
          ),
        }));
      },
    });
  },

  abort: () => {
    activeStream?.close();
    activeStream = null;
    set((s) => ({
      inflight: false,
      turns: s.turns.map((t) =>
        t.status === "streaming" ? { ...t, status: "complete" } : t
      ),
    }));
  },

  reset: () => {
    activeStream?.close();
    activeStream = null;
    set({ turns: [], inflight: false });
  },
}));
