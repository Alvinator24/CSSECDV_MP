import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();

    if (user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const { data: oldProject, error: fetchProjectError } = await supabaseServer
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (fetchProjectError) {
      return NextResponse.json({ error: fetchProjectError.message }, { status: 500 });
    }

    const { data: oldIssues, error: fetchIssuesError } = await supabaseServer
      .from("issues")
      .select("*")
      .eq("project_id", projectId);

    if (fetchIssuesError) {
      return NextResponse.json({ error: fetchIssuesError.message }, { status: 500 });
    }

    const { error: issuesError } = await supabaseServer
      .from("issues")
      .delete()
      .eq("project_id", projectId);

    if (issuesError) {
      return NextResponse.json({ error: issuesError.message }, { status: 500 });
    }

    const { error: projectError } = await supabaseServer
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    await logAudit({
      user: user.email,
      action: "DELETE",
      entity: "project",
      entityId: projectId,
      details: {
        project: oldProject,
        issues: oldIssues,
      },
    });

    return NextResponse.json({ message: "Project and issues deleted" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();

    if (user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await context.params;

    const body = await req.json();
    const { title, description } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const { data: oldProject, error: fetchError } = await supabaseServer
      .from("projects")
      .select("title, description")
      .eq("id", projectId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { data: updatedProject, error: updateError } = await supabaseServer
      .from("projects")
      .update({ title, description })
      .eq("id", projectId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const changes: Record<string, { old: any; new: any }> = {};
    if (oldProject.title !== updatedProject.title) {
      changes.title = { old: oldProject.title, new: updatedProject.title };
    }
    if (oldProject.description !== updatedProject.description) {
      changes.description = { old: oldProject.description, new: updatedProject.description };
    }

    if (Object.keys(changes).length > 0) {
      await logAudit({
        user: user.email,
        action: "UPDATE",
        entity: "project",
        entityId: projectId,
        details: changes,
      });
    }

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}