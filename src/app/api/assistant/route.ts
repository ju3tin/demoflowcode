import { NextRequest, NextResponse } from "next/server";
import {
  ASSISTANT_SYSTEM_PROMPT,
  ASSISTANT_TOOL,
  getAnthropicClient,
  MODEL,
} from "@/lib/anthropic";
import type { AssistantRequest, AssistantResponse, CanvasOp } from "@/types/flow";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AssistantRequest;

    if (!body?.messages?.length) {
      return NextResponse.json(
        { error: "Missing required field: messages" },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    const graphContext = `Current canvas graph:\n${JSON.stringify(
      body.graph,
      null,
      2
    )}`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: `${ASSISTANT_SYSTEM_PROMPT}\n\n${graphContext}`,
      tools: [ASSISTANT_TOOL],
      tool_choice: { type: "auto" },
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    let reply = "";
    const ops: CanvasOp[] = [];

    for (const block of message.content) {
      if (block.type === "text") {
        reply += block.text;
      } else if (
        block.type === "tool_use" &&
        block.name === "propose_canvas_changes"
      ) {
        const input = block.input as { ops?: CanvasOp[] };
        if (Array.isArray(input.ops)) ops.push(...input.ops);
      }
    }

    if (!reply.trim()) {
      reply = ops.length
        ? "Done — check the canvas."
        : "I didn't have anything to add. Could you say more about what you'd like?";
    }

    const response: AssistantResponse = { reply, ops };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
