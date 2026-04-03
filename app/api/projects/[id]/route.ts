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

    const { data, error } = await supabaseServer
      .from("projects")
      .delete()
      .eq("id", projectId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Project deleted", project: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}