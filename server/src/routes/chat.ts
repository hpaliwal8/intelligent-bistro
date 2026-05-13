import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import type { ChatRequest } from "../../../shared";
import { runChat } from "../ai/runChat";

export const chatRoute = new Hono();

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  cart: z.object({
    lines: z.array(
      z.object({
        lineId: z.string(),
        itemId: z.string(),
        quantity: z.number().int().min(1),
        modifiers: z.array(
          z.object({ groupId: z.string(), optionId: z.string() })
        ),
        notes: z.string().optional(),
      })
    ),
  }),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

const isDev = process.env.NODE_ENV !== "production";

chatRoute.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: "Invalid request",
        ...(isDev ? { issues: parsed.error.issues } : {}),
      },
      400
    );
  }

  const request: ChatRequest = parsed.data;

  return streamSSE(c, async (stream) => {
    try {
      await runChat(request, async (event) => {
        await stream.writeSSE({ data: JSON.stringify(event) });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await stream.writeSSE({
        data: JSON.stringify({ type: "error", message }),
      });
    } finally {
      await stream.writeSSE({ data: JSON.stringify({ type: "done" }) });
    }
  });
});
