import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ========== TOOL DECLARATION (corrected format) ==========

const routeToServiceTool = {
  functionDeclarations: [
    {
      name: "route_to_service",
      description: "Route user to a specific healthcare service page when they need detailed features like disease prediction, calorie tracking, fitness planning, mental health assessment,clinics nearby or period tracking",
      parameters: {
        type: "OBJECT",
        properties: {
          service: {
            type: "STRING",
            enum: ["disease-prediction", "calorie-tracking", "ai-fitness-planner","ai-fitness-tracker-workout-diet", "mental-health", "period-tracking","clinics-nearby"],
            description: "The service to route to"
          },
          reason: {
            type: "STRING",
            description: "Brief reason for routing to this service"
          }
        },
        required: ["service", "reason"]
      }
    }
  ]
};

// Service route mapping
const serviceRoutes: Record<string, string> = {
  "disease-prediction": "/diseasePrediction",
  "calorie-tracking": "/calorieTracker",
  "ai-fitness-planner": "/fitnessTrainer/planner",
 "ai-fitness-tracker-workout-diet": "/fitnessTrainer/tracker",
  "mental-health": "/mentalHealth",
  "period-tracking": "/period_tracker",
  "clinics-nearby": "/findClinics"
};

// ========== AGENT LOGIC ==========

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [routeToServiceTool],
      systemInstruction: `You are Healthcare+ assistant - a helpful health companion.

CORE BEHAVIOR:
- Answer simple health questions directly (general advice, definitions, basic info)
- For specific features like disease prediction, calorie tracking, fitness planning, mental health screening, or period tracking - use the route_to_service tool

AVAILABLE SERVICES:
- disease-prediction: Symptom checker, disease risk prediction
- calorie-tracking: Food logging, calorie analysis
- ai-fitness-planner: Workout planning and diet planning
- ai-fitness-tracker-workout-diet: Workout tracking and diet (what to eat), show diet
- mental-health: Mental wellness, mood tracking, PHQ-9 screening
- period-tracking: Menstrual cycle tracking and predictions

DECISION RULES:
1. Simple questions (What is diabetes? How much water should I drink?) → Answer directly
2. Needs specific service (Check my symptoms, Track my calories, Plan workout) → Use route_to_service tool
3. Unclear intent → Ask clarifying question

Be concise, friendly, and health-focused.`
    });

    const chat = model.startChat({
        history: history.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
        }))
    });


    const result = await chat.sendMessage(message);
    const response = result.response;

    // Check if model wants to call a function
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const functionCall = functionCalls[0];
      
      if (functionCall.name === "route_to_service") {
        const { service, reason } = functionCall.args;
        const route = serviceRoutes[service];

        return NextResponse.json({
          type: "redirect",
          message: reason,
          redirectTo: route,
          service: service
        });
      }
    }

    // Normal text response
    const text = response.text();
    return NextResponse.json({
      type: "answer",
      message: text
    });

  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { type: "error", message: "Failed to process request" },
      { status: 500 }
    );
  }
}
