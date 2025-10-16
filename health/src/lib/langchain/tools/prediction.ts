// lib/tools/triageSuggestTool.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { callGemini } from "@/lib/geminiService";
import { filterSafety } from "@/lib/safety";

const InputSchema = z.object({
  problem: z.string().min(3, "problem is required"),
  answers: z.record(z.any()).default({}),
});

type Input = z.infer<typeof InputSchema>;

export const triageSuggest = tool(
  async ({ problem, answers }: Input) => {
    const prompt = `
The user reported: "${problem}".
Follow-up answers: ${JSON.stringify(answers)}.

Suggest:
1. Likely conditions (max 3)
2. Safe over-the-counter medicines
3. Home care tips
4. Red-flag symptoms requiring doctor

Return as JSON:
{
  "conditions": [...],
  "medicines": [...],
  "care_tips": [...],
  "see_doctor_if": [...]
}
    `.trim();

    let response = await callGemini(prompt);
    response = filterSafety(response);

    // Ensure output is a JSON string; if response is object already, stringify it
    const text =
      typeof response === "string" ? response : JSON.stringify(response);

    // Optionally strip accidental fences
    const cleaned = text.replace(/``````/g, "").trim();

    // Validate minimal shape to avoid agent confusion
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Model did not return valid JSON.");
    }
    if (
      !parsed ||
      !Array.isArray(parsed.conditions) ||
      !Array.isArray(parsed.medicines) ||
      !Array.isArray(parsed.care_tips) ||
      !Array.isArray(parsed.see_doctor_if)
    ) {
      throw new Error("Invalid triage schema in model response.");
    }

    // Tools should return strings
    return JSON.stringify(parsed);
  },
  {
    name: "triage_suggest",
    description:
      "Given a symptom description and follow-up answers, suggest likely conditions, OTC medicines, home care tips, and red flags as JSON.",
    schema: InputSchema,
  }
);
