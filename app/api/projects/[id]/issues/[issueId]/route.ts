import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const user = verifyToken(token);
  if (!user) throw new Error("Unauthorized");

  return user;
}

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

    const { error } = await supabaseServer
      .from("issues")
      .delete()
      .eq("id", issueId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

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

    const { data, error } = await supabaseServer
      .from("issues")
      .update({
        title,
        description,
        priority,
        status,
        assigned_to,
      })
      .eq("id", issueId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}