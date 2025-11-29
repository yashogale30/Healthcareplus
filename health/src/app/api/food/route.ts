import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }); // try flash for stricter JSON

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
              `,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json", // ✅ enforce JSON
      },
    });

    let rawText = result.response.text();
    let foodData;

    try {
      foodData = JSON.parse(rawText);
    } catch (err) {
      // fallback cleaner
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        foodData = JSON.parse(match[0]);
      } else {
        console.error("Model did not return valid JSON:", rawText);
        return NextResponse.json(
          { error: "No valid JSON in model response", raw: rawText },
          { status: 500 }
        );
      }
    }

    // schema validation
    if (!isValidFoodResponse(foodData)) {
      console.error("Schema mismatch:", foodData);
      return NextResponse.json(
        { error: "Invalid schema in model response", raw: foodData },
        { status: 500 }
      );
    }

    return NextResponse.json(foodData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}