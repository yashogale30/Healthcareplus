// lib/tools/getLatestPlanTool.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { supabase } from "@/lib/supabaseClient";

const InputSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

type Input = z.infer<typeof InputSchema>;

export const getLatestFitnessPlan = tool(
  async ({ userId }: Input) => {
    const { data, error } = await supabase
      .from("fitness_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // returns null if none

    if (error) {
      // PGRST116: No rows found – treat as empty result
      if ((error as any).code !== "PGRST116") {
        throw new Error(error.message);
      }
    }

    // Return the same envelope as your route: { plan: data }
    return JSON.stringify({ plan: data ?? null });
  },
  {
    name: "get_latest_fitness_plan",
    description:
      "Fetch the most recent fitness plan for a given userId from Supabase.",
    schema: InputSchema,
  }
);
// This tool fetches the latest fitness plan for a user from Supabase.