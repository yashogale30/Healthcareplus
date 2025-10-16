// lib/tools/generateFitnessPlanTool.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabaseClient";

// Define the request schema
const InputSchema = z.object({
  userId: z.string().optional().describe("User id to persist plan in Supabase"),
  name: z.string(),
  age: z.number(),
  gender: z.string().optional(),
  weightKg: z.number().optional(),
  heightCm: z.number().optional(),
  activityLevel: z.string().optional(),
  goal: z.string(), // required
  oi: z.any().optional(),
  dietPreference: z.string().optional(),
});

type Input = z.infer<typeof InputSchema>;

export const generateFitnessPlan = tool(
  async (args: Input) => {
    const {
      userId,
      name,
      age,
      gender,
      weightKg,
      heightCm,
      activityLevel,
      goal,
      oi,
      dietPreference,
    } = args;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    if (!name || !age || !goal) {
      throw new Error("Please provide at least Name, Age, and Goal.");
    }

    const profile = {
      name,
      age,
      gender,
      weightKg,
      heightCm,
      activityLevel,
      goal,
      oi,
      dietPreference,
    };

    const prompt = `
Generate a workout and diet plan in valid JSON format only.
No code block markers.
The structure must be:
{
  "workoutPlan": [
    { "day": "Day 1", "exercises": [ { "name": "...", "sets": 3, "reps": 10 } ] }
  ],
  "dietPlan": [
    { "meal": "Breakfast", "items": [ { "food": "...", "quantity": "..." } ] }
  ]
}
User profile: ${JSON.stringify(profile)}
    `.trim();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const outputText = result.response.text();

    let structuredOutput: any;
    try {
      const cleaned = outputText.replace(/``````/g, "").trim();
      structuredOutput = JSON.parse(cleaned);

      if (!structuredOutput.workoutPlan || !structuredOutput.dietPlan) {
        throw new Error("Incomplete plan structure");
      }

      if (userId) {
        await supabase.from("fitness_plans").insert({
          user_id: userId,
          profile,
          workout_plan: structuredOutput.workoutPlan,
          diet_plan: structuredOutput.dietPlan,
        });
      }
    } catch (err: any) {
      throw new Error(`Invalid JSON from AI: ${err?.message ?? String(err)}`);
    }

    // Tools should return strings; return compact JSON string
    return JSON.stringify(structuredOutput);
  },
  {
    name: "generate_fitness_plan",
    description:
      "Generate a personalized workout and diet plan JSON from user profile and optionally persist to Supabase.",
    schema: InputSchema,
  }
);
