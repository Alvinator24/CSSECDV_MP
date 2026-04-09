import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();

    if (user.role !== "developer") {
      throw new Error("Unauthorized");
    }

    const { id: commentId } = await context.params;

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseServer
      .from("comments")
      .select("created_by")
      .eq("id", commentId)
      .single();

    if (existing?.created_by !== user.email) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseServer
      .from("comments")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    await logAudit({
      user: user.email,
      action: "UPDATE",
      entity: "comment",
      details: { content },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();

    if (user.role !== "developer") {
      throw new Error("Unauthorized");
    }

    const { id: commentId } = await context.params;

    const { data: existing } = await supabaseServer
      .from("comments")
      .select("created_by")
      .eq("id", commentId)
      .single();

    if (existing?.created_by !== user.email) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { error } = await supabaseServer
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    await logAudit({
      user: user.email,
      action: "DELETE",
      entity: "comment",
    });

    return NextResponse.json(
      { message: "Comment deleted" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}