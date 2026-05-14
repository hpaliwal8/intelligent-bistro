# The Intelligent Bistro

A high-fidelity mobile experience where an AI assistant manages restaurant ordering. Built with React Native (Expo) + Node.js, powered by Claude with tool use and streaming.

---

## Quick start (5 minutes)

You'll need: **Node 22+**, **npm**, and **Xcode + iOS Simulator** (macOS) — or any device with Expo Go.

```bash
# 1. Clone & install both projects (run from repo root)
( cd server && npm install )
( cd mobile && npm install --legacy-peer-deps )

# 2. Add your Anthropic API key to the SERVER side only
echo "ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE" > server/.env
echo "PORT=8787"                           >> server/.env
echo "ANTHROPIC_MODEL=claude-sonnet-4-6"   >> server/.env

# 3. Run server (Terminal A)
cd server
npx tsx src/index.ts
# → 🍽  Intelligent Bistro server listening on http://localhost:8787

# 4. Run mobile (Terminal B)
cd mobile
npx expo start --ios
# Press `i` to launch the iOS Simulator if it doesn't auto-open.
```

Open the app, browse the **Menu** tab, tap into an item, add to cart, then switch to the **Assistant** tab and try: *"add two spicy chicken sandwiches, extra spicy"*. Watch the assistant stream a reply while the cart-tab badge updates in real time.

---

## Prerequisites

| Requirement | Why |
|---|---|
| Node 22+ | Server runtime + Metro bundler |
| npm 10+ | Lockfiles are npm-format |
| Xcode + Simulator (macOS) | Easiest path to run the iOS build locally |
| Anthropic API key | Required only by the server; the mobile app never sees it |

For physical-device testing instead of Simulator, install **Expo Go** from the App Store / Play Store. You'll also need the dev machine's LAN IP — see [Running on a physical device](#running-on-a-physical-device).

---

## Stack

- **Mobile:** Expo SDK 54, React Native 0.81, TypeScript strict, Zustand (cart + chat state with versioned `migrate`), `expo-image` (bundled local menu assets + blurhash placeholders), `react-native-sse` (SSE consumer), `react-native-reanimated` (Button presses, cart-line pulse, splash, badge bounce), `expo-haptics`, Inter via `@expo-google-fonts/inter`
- **Backend:** Node.js + Hono (HTTP), `@anthropic-ai/sdk` (Claude Sonnet 4.6), Zod (request + tool-call validation), Hono's `streamSSE` (server-sent events)
- **Shared:** TypeScript types and the static menu JSON live in `shared/`, consumed by both projects via a workspace folder

---

## Project structure

```
intelligent-bistro/
├── shared/                       # Workspace folder used by both client + server
│   ├── menu.ts                   # 15 items across mains / sides / drinks / desserts
│   ├── types.ts                  # Cart, MenuItem, ChatRequest, CartAction, ChatStreamEvent
│   └── index.ts                  # Single re-export
├── server/
│   ├── src/
│   │   ├── index.ts              # Hono app, /health, /menu, /chat routes
│   │   ├── routes/chat.ts        # SSE endpoint, Zod request validation
│   │   └── ai/
│   │       ├── runChat.ts        # Anthropic streaming + tool-call accumulation
│   │       ├── tools.ts          # 4 tool definitions (add_item, update_quantity, …)
│   │       ├── validateAction.ts # Tool input → CartAction (menu-aware validation)
│   │       └── systemPrompt.ts   # Dynamic prompt with inlined menu + current cart
│   ├── scripts/
│   │   └── test-ai-plumbing.ts   # 21-assertion smoke test (no API call needed)
│   └── .env.example
└── mobile/
    ├── app/                      # expo-router file-based routing
    │   ├── _layout.tsx           # Root Stack + font loading + BistroSplash overlay
    │   ├── (tabs)/
    │   │   ├── _layout.tsx       # Tab navigator with BlurView background + animated cart badge
    │   │   ├── index.tsx         # Menu browse (with "Tonight's picks" hero strip)
    │   │   ├── chat.tsx          # AI assistant
    │   │   └── cart.tsx          # Cart screen
    │   └── item/[id].tsx         # Item detail modal w/ modifier picker
    ├── assets/menu/              # 15 bundled menu images (no Unsplash dependency)
    └── src/
        ├── api/chat.ts           # SSE client (react-native-sse)
        ├── components/           # MenuCard, CartLineRow, ChatBubble, BistroSplash, PopularStrip, …
        ├── state/                # cartStore.ts (+ .test.ts), chatStore.ts
        ├── utils/                # price.ts, menuImages.ts (local asset map)
        └── theme.ts              # Colors + Inter font family map
```

---

## Architecture

The mobile app owns cart state via Zustand (`useCart`) and persists it to AsyncStorage with a versioned migration handler. Each chat turn POSTs `{ message, cart, history }` to the server's `/chat` endpoint.

The server:

1. Validates the request with Zod.
2. Builds a system prompt that inlines the full menu (with `menu_id` / `group_id` / `option_id` values) and the current cart (with `lineId`s).
3. Calls Claude with 4 tools: `add_item`, `update_quantity`, `remove_line`, `clear_cart`.
4. Streams Claude's response back as **server-sent events**. Each token of assistant text becomes a `text` event; each completed tool call is validated against the menu (rejecting unknown items, missing required modifiers, etc.) and emitted as an `action` event with a typed `CartAction`. The final `done` event closes the turn.

The mobile chat store consumes the stream, appends text deltas to the current assistant turn, and forwards each `action` to `useCart.applyAiAction()` — so the cart updates live as the assistant explains what it's doing.

---

## Running on a physical device

Localhost won't reach your dev machine from a phone. Set the API base URL to your LAN IP:

```bash
# Find your IP (macOS)
ipconfig getifaddr en0
# → e.g. 192.168.1.42

# Create mobile/.env
echo "EXPO_PUBLIC_API_URL=http://192.168.1.42:8787" > mobile/.env

# Restart Expo so it picks up the env
```

The Hono server already binds to `0.0.0.0` so it accepts LAN connections. Make sure your firewall isn't blocking port 8787.

---

## Verifying the install

```bash
# Server: typecheck + 21-assertion plumbing test (no API call)
cd server
npx tsc --noEmit
npx tsx scripts/test-ai-plumbing.ts

# Mobile: typecheck + doctor + bundle test (no Simulator needed)
cd mobile
npx tsc --noEmit
npx expo-doctor               # → 17/17 checks passed
npm test                      # → 14 cart-store unit tests
npx expo export --platform ios --output-dir /tmp/bundle-check
```

Or skip straight to running it — the doctor / bundle checks are belt-and-braces.

---

## For a clean cold-start (Loom recording)

The quick-start above uses **Expo Go**, which shows its own white launch screen with your app's icon before our JS loads. Fine for development, but you'll see a brief flash that isn't ours.

For a polished cold-start where the iOS launch screen is *already* our dark bistro background, build a custom dev client once:

```bash
cd mobile
npx expo run:ios     # ~5-10 min first build; installs a standalone dev binary
```

After that, tapping the app icon in the Simulator gives the end-to-end branded launch: dark splash → animated flame + wordmark → cross-fade to menu. Use `npx expo start --dev-client` for fast-refresh while iterating.

Requires Xcode + CocoaPods + the iOS simulator runtime that matches your Xcode SDK (e.g. iOS 18.x). If `expo run:ios` complains about a missing destination, run `xcodebuild -downloadPlatform iOS` to install the runtime.

---

## Common issues

**`Cannot find module '@anthropic-ai/sdk'`** — run `npm install` inside `server/`, not the root.

**`ANTHROPIC_API_KEY is not set` shows up in the chat as a server error** — you have a server running but no `.env` next to it. Re-check `server/.env` exists and has the key.

**Mobile install fails with peer-dep conflicts** — use `npm install --legacy-peer-deps` (React 19 + a few RN libs still ship older peer ranges).

**Chat says "Connection error" or nothing happens** — server isn't running, or the mobile `EXPO_PUBLIC_API_URL` points at the wrong host. Run `curl http://localhost:8787/health` to check the server is up; for a physical device, confirm the LAN IP and that port 8787 is reachable.

**iOS Simulator complains about Hermes / Reanimated** — clear Metro cache and rebuild: `npx expo start --clear`.

**Cart persists across app launches but the menu changed** — by design: `cartStore` has a `migrate` handler that drops lines referencing unknown menu IDs at rehydration time. Bump `version:` in [cartStore.ts](mobile/src/state/cartStore.ts) when the menu schema changes.

---

## Security notes

- `server/.env` is `.gitignore`d; `server/.env.example` is a committed placeholder. Never put a real key in `.env.example`.
- The mobile app does **not** carry the Anthropic key. Only the server talks to Claude.
- The server's chat endpoint sanitizes its Zod error response when `NODE_ENV=production` (no schema leakage to clients).
- If you accidentally commit a key, rotate it at [console.anthropic.com](https://console.anthropic.com) — `git filter-repo` cleanup is not enough on its own once a key has been pushed.

---

## Scripts cheat sheet

### Server (`cd server`)
| Command | Purpose |
|---|---|
| `npx tsx src/index.ts` | Run the API server |
| `npx tsx watch src/index.ts` | Run with file-watch auto-restart (also `npm run dev`) |
| `npx tsc --noEmit` | Typecheck |
| `npx tsx scripts/test-ai-plumbing.ts` | Run the validator/tools smoke test (no Anthropic call) |

### Mobile (`cd mobile`)
| Command | Purpose |
|---|---|
| `npx expo start --ios` | Run on iOS Simulator via Expo Go (fast iteration) |
| `npx expo run:ios` | Build standalone dev client (clean cold-start; ~5-10 min first time) |
| `npx expo start --dev-client` | Fast-refresh Metro server for an installed dev client |
| `npx expo start` then scan QR with Expo Go | Run on physical device |
| `npx expo start --clear` | Reset Metro cache (when things get weird) |
| `npx expo-doctor` | Check Expo SDK dep health (17 checks) |
| `npx tsc --noEmit` | Typecheck |
| `npm test` | Run cart-store unit tests (14 cases) |
| `npx expo export --platform ios --output-dir /tmp/x` | Produce a Hermes bundle without launching the Simulator |
