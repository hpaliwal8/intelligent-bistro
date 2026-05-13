# The Intelligent Bistro

A high-fidelity mobile experience where an AI assistant manages restaurant ordering. Built with React Native (Expo) + Node.js, powered by Claude with tool use.

## Stack

- **Mobile:** Expo, TypeScript, NativeWind v4, Zustand, react-native-reanimated
- **Backend:** Node.js, Hono, Anthropic SDK (Claude Sonnet 4.6), Zod
- **AI:** Hybrid streaming — assistant text streams token-by-token while tool calls execute structured cart actions

## Structure

```
intelligent-bistro/
  mobile/   # Expo app
  server/   # Hono API
  shared/   # Menu data + shared TypeScript types
```

## Setup

### Server

```bash
cd server
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
npm run dev
```

Server runs on `http://localhost:8787`.

### Mobile

```bash
cd mobile
npm install
# Point the app at your server (LAN IP for device, or http://localhost:8787 for simulator)
echo "EXPO_PUBLIC_API_URL=http://localhost:8787" > .env
npx expo start
```

## Architecture

The mobile app owns cart state via Zustand. Each chat turn sends `{ message, cart, history }` to `/chat`. The server calls Claude with the menu inlined in the system prompt and tools defined for `add_item`, `update_quantity`, `remove_item`, `clear_cart`, and `ask_clarification`. The response is a server-sent event stream: `text` deltas for the assistant message, `action` events for validated cart mutations, and a `done` event when the turn ends. The client applies actions optimistically and animates the cart.
