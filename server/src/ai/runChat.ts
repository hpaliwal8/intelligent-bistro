import type { ChatRequest, ChatStreamEvent } from "../../../shared/types";

// Placeholder until Day 3 — echoes a friendly stub so the wire is testable.
// Will be replaced with a real Anthropic streaming + tool-use implementation.
export async function runChat(
  req: ChatRequest,
  emit: (event: ChatStreamEvent) => Promise<void>
): Promise<void> {
  const reply = `(stub) You said: "${req.message}". Cart has ${req.cart.lines.length} line(s).`;
  for (const chunk of reply.match(/.{1,16}/g) ?? []) {
    await emit({ type: "text", delta: chunk });
    await new Promise((r) => setTimeout(r, 40));
  }
}
