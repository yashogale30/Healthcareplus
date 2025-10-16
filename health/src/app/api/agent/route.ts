// src/app/api/agent/route.ts
import { NextResponse } from "next/server";
import { makeAgent } from "@/lib/langchain/agent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { input, ...args } = body; // input = user message; args = potential tool args

    const executor = makeAgent();
    const result = await executor.invoke({
      input: input ?? "Help me using available tools.",
      ...args, // pass-through fields (e.g., imageBase64, userId, query, periodCycles)
    });

    // result.output is a string; if a tool returned JSON, it’ll likely be that string
    return NextResponse.json({ output: result.output }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Agent error" }, { status: 500 });
  }
}
