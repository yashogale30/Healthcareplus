// src/lib/langchain/agent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// import your existing tools
import { analyzeFoodFromImage } from "./tools/food";
import { generateFitnessPlan } from "./tools/generate";
import { saveFitnessPlan } from "./tools/savePlan";
import { getLatestFitnessPlan } from "./tools/getLatestPlan";
import { listPeriodCycles, createPeriodCycle } from "./tools/period";
import { predictPeriodFromCycles } from "./tools/predict";
import { generateFollowups } from "./tools/followups";
import { searchTopPlaces } from "./tools/search";

const tools = [
  analyzeFoodFromImage,
  generateFitnessPlan,
  saveFitnessPlan,
  getLatestFitnessPlan,
  listPeriodCycles,
  createPeriodCycle,
  predictPeriodFromCycles,
  generateFollowups,
  searchTopPlaces,
];

export function makeAgent() {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash", // or "gemini-2.5-flash" if available
    apiKey: process.env.GEMINI_API_KEY!,
    temperature: 0,
  });
  
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful healthcare assistant. Use the available tools to answer user queries."]
  ]);
  
  const agent = createToolCallingAgent({ llm, tools, prompt });
  const executor = new AgentExecutor({ agent, tools });
  return executor;
}
