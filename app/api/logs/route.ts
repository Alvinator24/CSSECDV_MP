import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}