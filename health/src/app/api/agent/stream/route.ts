// src/app/api/agent/stream/route.ts
import { makeAgent } from "@/lib/langchain/agent";

export async function POST(req: Request) {
  const body = await req.json();
  const { input, ...args } = body;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const executor = makeAgent();
        const events = await executor.streamEvents(
          { input: input ?? "Help me using available tools.", ...args },
          { version: "v2" }
        );
        for await (const ev of events) {
          controller.enqueue(encoder.encode(`${JSON.stringify(ev)}\n`));
        }
      } catch (e: any) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: e?.message })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}
