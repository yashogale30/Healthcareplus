// app/api/savePlan/route.ts (Next.js 13+)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = [
      'user_id', 'name', 'age', 'gender',
      'weight_kg', 'height_cm', 'activity_level',
      'goal', 'diet_preference', 'workout_plan', 'diet_plan'
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
      }
    }

    // Ensure JSON fields are valid
    const workout_plan = Array.isArray(body.workout_plan) ? body.workout_plan : [];
    const diet_plan = Array.isArray(body.diet_plan) ? body.diet_plan : [];

    const { data, error } = await supabase
        .from('fitness_plans')
        .insert([{
            user_id: body.user_id,
            name: body.name,
            age: body.age,
            gender: body.gender,
            weight_kg: body.weight_kg,
            height_cm: body.height_cm,
            activity_level: body.activity_level,
            goal: body.goal,
            oi: body.oi || '',
            diet_preference: body.diet_preference,
            workout_plan,
            diet_plan
        }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}