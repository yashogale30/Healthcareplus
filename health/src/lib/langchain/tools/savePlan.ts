// lib/tools/savePlanTool.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { supabase } from "@/lib/supabaseClient";

const InputSchema = z.object({
  user_id: z.string().min(1, "user_id is required"),
  name: z.string().min(1),
  age: z.number(),
  gender: z.string().min(1),
  weight_kg: z.number(),
  height_cm: z.number(),
  activity_level: z.string().min(1),
  goal: z.string().min(1),
  diet_preference: z.string().min(1),
  workout_plan: z.array(z.any()).default([]),
  diet_plan: z.array(z.any()).default([]),
  oi: z.string().optional().default(""),
});

type Input = z.infer<typeof InputSchema>;

export const saveFitnessPlan = tool(
  async (body: Input) => {
    // Defensive normalization like your route
    const workout_plan = Array.isArray(body.workout_plan) ? body.workout_plan : [];
    const diet_plan = Array.isArray(body.diet_plan) ? body.diet_plan : [];

    const { data, error } = await supabase
      .from("fitness_plans")
      .insert([
        {
          user_id: body.user_id,
          name: body.name,
          age: body.age,
          gender: body.gender,
          weight_kg: body.weight_kg,
          height_cm: body.height_cm,
          activity_level: body.activity_level,
          goal: body.goal,
          oi: body.oi ?? "",
          diet_preference: body.diet_preference,
          workout_plan,
          diet_plan,
        },
      ])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    // Tools should return strings for model consumption
    return JSON.stringify({ success: true, data });
  },
  {
    name: "save_fitness_plan",
    description:
      "Persist a full fitness plan and user profile fields into Supabase (fitness_plans table). Returns success and inserted row(s).",
    schema: InputSchema,
  }
);
