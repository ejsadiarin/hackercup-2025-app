import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  // Create a date range for the entire day
  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(`${date}T23:59:59.999Z`);

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_date", startDate.toISOString())
    .lte("start_date", endDate.toISOString()); // use endDate here

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(tasks);
}
