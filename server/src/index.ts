import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { MENU } from "../../shared/menu";
import { chatRoute } from "./routes/chat";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) =>
  c.json({ ok: true, model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6" })
);

app.get("/menu", (c) => c.json({ items: MENU }));

app.route("/chat", chatRoute);

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🍽  Intelligent Bistro server listening on http://localhost:${info.port}`);
});
