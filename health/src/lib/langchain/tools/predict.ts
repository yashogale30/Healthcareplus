// lib/tools/predictPeriodTool.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Input schema: requires an array of { start_date, end_date }
const InputSchema = z.object({
  periodCycles: z
    .array(
      z.object({
        start_date: z.string().min(8).describe("YYYY-MM-DD"),
        end_date: z.string().min(8).describe("YYYY-MM-DD"),
      })
    )
    .min(2, "Not enough data for prediction."),
});

type Input = z.infer<typeof InputSchema>;

export const predictPeriodFromCycles = tool(
  async ({ periodCycles }: Input) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Analyze the following period cycle data to predict the next cycle start date, the number of days the period will last, and the ovulation window.
The data is an array of objects, each with a 'start_date' and 'end_date' (in YYYY-MM-DD format).

Input data:
${JSON.stringify(periodCycles)}

Predict the start date of the next period and how many days it will last. Also, predict the ovulation window (5 days before and including the ovulation day).

DO NOT add any conversational text before or after the JSON. The output must be a single, valid JSON object with no other content.

Provide the answer as a JSON object with three fields:
'nextPeriodStartDate' (string, YYYY-MM-DD),
'nextPeriodDuration' (number, in days),
'ovulationWindow' (array of strings, YYYY-MM-DD).

Example output:
{
  "nextPeriodStartDate": "2025-10-01",
  "nextPeriodDuration": 5,
  "ovulationWindow": ["2025-09-17", "2025-09-18", "2025-09-19", "2025-09-20", "2025-09-21"]
}
    `.trim();

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Cleanup fence if model ignores instruction
    text = text.replace(/``````/g, "").trim();

    // Parse and sanity-check shape
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Model did not return valid JSON.");
    }

    if (
      !parsed ||
      typeof parsed.nextPeriodStartDate !== "string" ||
      typeof parsed.nextPeriodDuration !== "number" ||
      !Array.isArray(parsed.ovulationWindow)
    ) {
      throw new Error("Invalid prediction schema in model response.");
    }

    // Tools should return strings
    return JSON.stringify(parsed);
  },
  {
    name: "predict_period_from_cycles",
    description:
      "Predict next period start date, duration, and ovulation window from historical cycles.",
    schema: InputSchema,
  }
);
