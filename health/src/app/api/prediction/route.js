import { callGemini } from '@/lib/geminiService';
import { filterSafety } from '@/lib/safety';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const { problem, answers } = body;
  if (!problem || !answers) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

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
  `;

  try {
    let response = await callGemini(prompt);
    response = filterSafety(response);
    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}
