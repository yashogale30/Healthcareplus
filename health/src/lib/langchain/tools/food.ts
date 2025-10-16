// lib/tools/foodAnalyzerTool.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Same validation as your route
function isValidFoodResponse(data: any) {
  return (
    data &&
    Array.isArray(data.items) &&
    typeof data.notes === "string" &&
    data.items.every(
      (item: any) =>
        typeof item.name === "string" &&
        typeof item.calories_kcal === "number" &&
        typeof item.protein_g === "number" &&
        typeof item.carbs_g === "number" &&
        typeof item.fat_g === "number" &&
        typeof item.estimated_portion_g === "number"
    )
  );
}

// Create a reusable tool
export const analyzeFoodFromImage = tool(
  async ({ imageBase64, mimeType }: { imageBase64: string; mimeType?: string }) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || "image/jpeg",
              },
            },
            {
              text: `
You are a food recognition and nutrition expert.
Identify the food in the photo and estimate calories + macros.
Respond ONLY with JSON in this schema (no markdown, no text outside JSON):

{
  "items": [
    {
      "name": "Apple",
      "calories_kcal": 95,
      "protein_g": 0.5,
      "carbs_g": 25,
      "fat_g": 0.3,
      "estimated_portion_g": 150
    }
  ],
  "notes": "Values are approximate. Portion estimated visually."
}
            `.trim(),
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let rawText = result.response.text();
    let foodData: any;

    try {
      foodData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/``````/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("No valid JSON in model response");
      }
      foodData = JSON.parse(match[0]);
    }

    if (!isValidFoodResponse(foodData)) {
      throw new Error("Invalid schema in model response");
    }

    // Return the validated object as a JSON string so LLMs can easily consume
    return JSON.stringify(foodData);
  },
  {
    name: "analyze_food_from_image",
    description:
      "Analyze a food image to return items with estimated calories and macros. Input must be base64 image data and optional mimeType.",
    schema: z.object({
      imageBase64: z.string().min(10).describe("Base64-encoded image data without data: prefix"),
      mimeType: z
        .string()
        .optional()
        .describe("Image MIME type like image/jpeg or image/png"),
    }),
  }
);
