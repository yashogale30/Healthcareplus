// src/app/agent/page.tsx
"use client";

import { useState, useRef } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function AgentPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useStreaming, setUseStreaming] = useState(false);

  // Optional: stash candidate tool args you might pass with input
  const imageBase64Ref = useRef<string | undefined>(undefined);
  const mimeTypeRef = useRef<string | undefined>(undefined);
  const userIdRef = useRef<string | undefined>(undefined);
  const periodCyclesRef = useRef<any[] | undefined>(undefined);
  const queryRef = useRef<string | undefined>(undefined);
  const latRef = useRef<string | undefined>(undefined);
  const lngRef = useRef<string | undefined>(undefined);

  async function sendNonStreaming(body: any) {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return json.output ?? json.error ?? "No output";
  }

  async function sendStreaming(body: any, onDelta: (chunk: string) => void) {
    const res = await fetch("/api/agent/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.body) throw new Error("No response body");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let finalText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const ev = JSON.parse(line);
          // Heuristic: token stream from LLM
          if (ev.event === "on_chat_model_stream" && typeof ev.data?.chunk?.content === "string") {
            finalText += ev.data.chunk.content;
            onDelta(ev.data.chunk.content);
          }
          // Heuristic: final output on chain end
          if (ev.event === "on_chain_end" && typeof ev.data?.output?.output === "string") {
            finalText = ev.data.output.output;
          }
        } catch {
          // ignore malformed lines
        }
      }
    }
    return finalText;
  }

  async function onSend() {
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // Package user input plus candidate tool args (agent uses them if needed)
    const body = {
      input: userMsg.content,
      imageBase64: imageBase64Ref.current,
      mimeType: mimeTypeRef.current,
      userId: userIdRef.current,
      periodCycles: periodCyclesRef.current,
      query: queryRef.current,
      lat: latRef.current,
      lng: lngRef.current,
    };

    try {
      if (!useStreaming) {
        const text = await sendNonStreaming(body);
        setMessages((m) => [...m, { role: "assistant", content: text }]);
      } else {
        let acc = "";
        setMessages((m) => [...m, { role: "assistant", content: "" }]);
        const text = await sendStreaming(body, (delta) => {
          acc += delta;
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              last.content += delta;
            }
            return copy;
          });
        });
        // Ensure final text is set (covers cases where final output arrives as a single event)
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            last.content = text || last.content;
          }
          return copy;
        });
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: e?.message ?? "Error" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Healthcare Agent</h1>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useStreaming}
            onChange={(e) => setUseStreaming(e.target.checked)}
          />
          Streaming
        </label>
        {/* Optional quick inputs for common tool args for testing */}
        <input
          className="border rounded px-2 py-1 text-sm flex-1"
          placeholder="query (e.g., vegan restaurants)"
          onChange={(e) => (queryRef.current = e.target.value || undefined)}
        />
        <input
          className="border rounded px-2 py-1 text-sm w-24"
          placeholder="lat"
          onChange={(e) => (latRef.current = e.target.value || undefined)}
        />
        <input
          className="border rounded px-2 py-1 text-sm w-24"
          placeholder="lng"
          onChange={(e) => (lngRef.current = e.target.value || undefined)}
        />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask the agent (it can decide to call your tools)…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
        />
        <button
          className="border rounded px-4 py-2"
          onClick={onSend}
          disabled={loading}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>

      <section className="border rounded p-3 min-h-[300px] space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-blue-700" : "text-green-700"}>
            <span className="font-medium">{m.role}:</span> <span>{m.content}</span>
          </div>
        ))}
        {!messages.length && (
          <div className="text-gray-500 text-sm">
            Try: “Analyze this food photo” (then attach imageBase64 in code), “Generate a fitness plan for a 25y male…”, “Predict my next period from these cycles…”, or “Find top-rated physiotherapists near me”. 
          </div>
        )}
      </section>
    </main>
  );
}
