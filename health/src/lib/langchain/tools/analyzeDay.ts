import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

class AnalyseDayTool extends StructuredTool {
  name = "analyseDay";
  description =
    "Compares planned vs actual fitness data and returns adherence percentages and feedback.";
  schema = z.object({
    plan: z.object({
      workout: z.any(),
      diet: z.any(),
    }),
    actual: z.object({
      workout: z.any(),
      diet: z.any(),
    }),
  });

  async _call(input: { plan: any; actual: any }) {
    const { plan, actual } = input;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Compare today's actual fitness data with the planned data.
Return JSON with:
- workout_adherence % (0-100)
- diet_adherence % (0-100)
- feedback as a short message

Planned Workout: ${JSON.stringify(plan.workout)}
Actual Workout: ${typeof actual.workout === "string" ? actual.workout : JSON.stringify(actual.workout)}

Planned Diet: ${JSON.stringify(plan.diet)}
Actual Diet: ${typeof actual.diet === "string" ? actual.diet : JSON.stringify(actual.diet)}

Respond ONLY with valid JSON:
{
    "workout_adherence": number,
    "diet_adherence": number,
    "feedback": string
}
    `;

    const result = await model.generateContent(prompt);
    const outputText = result.response.text();
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { status: "error", feedback: "No valid JSON from AI" };
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  }
}

export const analyseDayTool = new AnalyseDayTool();
