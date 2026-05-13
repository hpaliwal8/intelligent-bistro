import { vi } from "vitest";

// AsyncStorage is React-Native-only; mock it so Zustand's persist middleware
// can load in a Node test environment without exploding.
const memoryStore = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (k: string) => memoryStore.get(k) ?? null),
    setItem: vi.fn(async (k: string, v: string) => {
      memoryStore.set(k, v);
    }),
    removeItem: vi.fn(async (k: string) => {
      memoryStore.delete(k);
    }),
    clear: vi.fn(async () => {
      memoryStore.clear();
    }),
  },
}));

// `react-native-uuid` works in Node via crypto.randomUUID under the hood, so no mock needed.
