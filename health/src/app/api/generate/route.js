import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const data = await req.json();
    const { name, age, gender, weightKg, heightCm, activityLevel, goal,oi, dietPreference } = data;

    if (!name || !age || !goal) {
      return NextResponse.json(
        { error: "Please provide at least Name, Age, and Goal." },
        { status: 400 }
      );
    }

    // ✅ Create the profile object
    const profile = {
      name,
      age,
      gender,
      weightKg,
      heightCm,
      activityLevel,
      goal,
      oi,
      dietPreference
    };

    const prompt = `
      Generate a workout and diet plan in valid JSON format only. 
      No code block markers (like \`\`\`json). 
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
    `;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const outputText = result.response.text();

    let structuredOutput;
    try {
      // ✅ Remove accidental code block markers before parsing
      const cleanedText = outputText.replace(/```json|```/g, '').trim();
      structuredOutput = JSON.parse(cleanedText);

      if (!structuredOutput.workoutPlan || !structuredOutput.dietPlan) {
        throw new Error("Incomplete plan structure");
      }
    } catch (err) {
      console.error("AI JSON parse error:", err);
      return NextResponse.json({ error: "Invalid JSON from AI"}, { status: 500 });
    }

    return NextResponse.json({ output: structuredOutput });

  } catch (err) {
    console.error("Gemini API Error:", err);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}