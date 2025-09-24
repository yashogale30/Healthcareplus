import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from('period_cycles')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch period data' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { startDate, endDate, userId } = await req.json();

  const { data, error } = await supabase
    .from('period_cycles')
    .insert([{
      start_date: startDate,
      end_date: endDate,
      user_id: userId,
    }])
    .select();

  if (error) {
    return NextResponse.json({ error: 'Failed to save period data' }, { status: 500 });
  }

  return NextResponse.json({ data });
}