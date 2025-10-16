// lib/tools/periodCyclesTools.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { supabase } from "@/lib/supabaseClient";

// GET latest-first list for a user (optional filter)
export const listPeriodCycles = tool(
  async ({ userId }: { userId?: string }) => {
    let query = supabase.from("period_cycles").select("*").order("start_date", { ascending: false });
    if (userId) query = query.eq("user_id", userId);

    const { data, error } = await query;

    if (error) {
      throw new Error("Failed to fetch period data");
    }
    // Return as a JSON string for LLM determinism
    return JSON.stringify({ cycles: data ?? [] });
  },
  {
    name: "list_period_cycles",
    description:
      "List period cycles sorted by start_date descending. Optionally filter by userId.",
    schema: z.object({
      userId: z.string().optional().describe("Filter cycles for this user id"),
    }),
  }
);

// POST insert a new cycle
export const createPeriodCycle = tool(
  async ({
    startDate,
    endDate,
    userId,
  }: {
    startDate: string;
    endDate?: string | null;
    userId: string;
  }) => {
    const { data, error } = await supabase
      .from("period_cycles")
      .insert([
        {
          start_date: startDate,
          end_date: endDate ?? null,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      throw new Error("Failed to save period data");
    }
    return JSON.stringify({ data: data ?? [] });
  },
  {
    name: "create_period_cycle",
    description:
      "Create a period cycle row with start_date, optional end_date, and user_id. Returns inserted row(s).",
    schema: z.object({
      startDate: z.string().describe("ISO date string for cycle start, e.g. 2025-10-16"),
      endDate: z.string().nullable().optional().describe("ISO date string for cycle end"),
      userId: z.string().min(1).describe("User id to associate the cycle"),
    }),
  }
);
