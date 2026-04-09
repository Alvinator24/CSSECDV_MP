import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();

    if (!["developer", "manager"].includes(user.role)) {
      throw new Error("Unauthorized");
    }

    const { id: issueId } = await context.params;

    const { data, error } = await supabaseServer
      .from("comments")
      .select("*")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

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

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();

    if (user.role !== "manager") {
      throw new Error("Unauthorized");
    }

    const { id: issueId } = await context.params;

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("comments")
      .insert([
        {
          issue_id: issueId,
          content,
          created_by: user.email,
        },
      ])
      .select()
      .single();

    await logAudit({
      user: user.email,
      action: "CREATE",
      entity: "comment",
      details: { content },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}