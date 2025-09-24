import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { plan, actual } = await req.json();

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
        return Response.json({ status: "error", feedback: "No valid JSON from AI" }, { status: 200 });
        }

        const analysis = JSON.parse(jsonMatch[0]);

        return Response.json({ status: "success", ...analysis }, { status: 200 });
    } catch (err) {
        console.error(err);
        return Response.json({ status: "error", feedback: "Gemini analysis failed" }, { status: 500 });
    }
}