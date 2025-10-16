// src/lib/langchain/tools/followups.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { callGemini } from "@/lib/geminiService";

export const generateFollowups = tool(
  async ({ problem }: { problem: string }) => {
    const prompt = `
A user reports: "${problem}".
Generate 5–6 short follow-up questions to clarify their symptoms.
Return ONLY a JSON array of strings (questions). No markdown, no explanation.
    `.trim();

    const response = await callGemini(prompt);

    // Make sure we return a clean JSON array string
    const text = typeof response === "string" ? response : JSON.stringify(response);
    const cleaned = text.replace(/``````/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Model did not return valid JSON array.");
    }
    if (!Array.isArray(parsed) || parsed.some((q) => typeof q !== "string")) {
      throw new Error("Invalid follow-ups JSON: expected array of strings.");
    }

    // Tools should return strings
    return JSON.stringify(parsed);
  },
  {
    name: "generate_followups",
    description:
      "Given a symptom description, generate 5–6 concise follow-up questions as a JSON array of strings.",
    schema: z.object({
      problem: z.string().min(3, "Symptom description required"),
    }),
  }
);
