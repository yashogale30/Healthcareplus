import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { periodCycles } = await req.json();

    if (!periodCycles || periodCycles.length < 2) {
      return NextResponse.json({ message: 'Not enough data for prediction.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // src/app/api/predict/route.ts

// ...

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
 `;

// ...

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // The Fix: Clean the response string before parsing it
    // This removes the surrounding "```json" and "```"
    text = text.replace(/```json\n|```/g, '').trim();

    const prediction = JSON.parse(text);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return NextResponse.json({ message: 'Error generating prediction.' }, { status: 500 });
  }
}