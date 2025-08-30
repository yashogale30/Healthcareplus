import { callGemini } from '@/lib/geminiService';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const { problem } = body;
  if (!problem) {
    return NextResponse.json({ error: "Symptom description required" }, { status: 400 });
  }
  const prompt = `
    A user reports: "${problem}".
    Generate 5–6 short follow-up questions to clarify their symptoms.
    Return ONLY a JSON array of questions, with no markdown or explanation.
  `;
  try {
    const followups = await callGemini(prompt);
    return NextResponse.json({ followups });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get follow-ups" }, { status: 500 });
  }
}
