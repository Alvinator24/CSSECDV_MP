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

    const { data: oldComment, error: fetchError } = await supabaseServer
      .from("comments")
      .select("*")
      .eq("id", commentId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (oldComment?.created_by !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: updatedComment, error: updateError } = await supabaseServer
      .from("comments")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const changes: Record<string, { old: any; new: any }> = {};
    if (oldComment.content !== updatedComment.content) {
      changes.content = { old: oldComment.content, new: updatedComment.content };
    }

    if (Object.keys(changes).length > 0) {
      await logAudit({
        user: user.email,
        action: "UPDATE",
        entity: "comment",
        entityId: commentId,
        details: changes,
      });
    }

    return NextResponse.json(updatedComment, { status: 200 });
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

    const { data: oldComment, error: fetchError } = await supabaseServer
      .from("comments")
      .select("*")
      .eq("id", commentId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (oldComment?.created_by !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabaseServer
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await logAudit({
      user: user.email,
      action: "DELETE",
      entity: "comment",
      entityId: commentId,
      details: oldComment,
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