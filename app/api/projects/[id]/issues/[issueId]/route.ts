import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/auth";

export async function DELETE(req: Request, context: { params: Promise<{ id: string; issueId: string }> }) {
  try {
    const user = await requireAuth();

    if (!["manager", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { issueId } = await context.params;

    if (!issueId) {
      return NextResponse.json(
        { error: "Issue ID is required" },
        { status: 400 }
      );
    }

    const { data: oldIssue, error: fetchError } = await supabaseServer
      .from("issues")
      .select("*")
      .eq("id", issueId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error: deleteError } = await supabaseServer
      .from("issues")
      .delete()
      .eq("id", issueId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await logAudit({
      user: user.email,
      action: "DELETE",
      entity: "issue",
      entityId: issueId,
      details: oldIssue,
    });

    return NextResponse.json({ message: "Issue deleted" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string; issueId: string }> }) {
  try {
    const user = await requireAuth();

    if (!["manager", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { issueId } = await context.params;
    const body = await req.json();

    const { title, description, priority, status, assigned_to } = body;

    if (!issueId) {
      return NextResponse.json(
        { error: "Issue ID is required" },
        { status: 400 }
      );
    }

    const { data: oldIssue, error: fetchError } = await supabaseServer
      .from("issues")
      .select("*")
      .eq("id", issueId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { data: updatedIssue, error: updateError } = await supabaseServer
      .from("issues")
      .update({ title, description, priority, status, assigned_to })
      .eq("id", issueId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const changes: Record<string, { old: any; new: any }> = {};
    ["title", "description", "priority", "status", "assigned_to"].forEach((field) => {
      if ((oldIssue as any)[field] !== (updatedIssue as any)[field]) {
        changes[field] = { old: (oldIssue as any)[field], new: (updatedIssue as any)[field] };
      }
    });

    if (Object.keys(changes).length > 0) {
      await logAudit({
        user: user.email,
        action: "UPDATE",
        entity: "issue",
        entityId: issueId,
        details: changes,
      });
    }

    return NextResponse.json(updatedIssue, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}