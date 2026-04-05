import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { logAudit } from "@/lib/audit";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const user = verifyToken(token);
  if (!user) throw new Error("Unauthorized");

  return user;
}

export async function GET() {
  try {
    const user = await requireAuth();

     if (user.role !== "manager") {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    let query = supabaseServer
      .from("projects")
      .select("id, title, description, created_at")

    const { data, error } = await query;

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

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

     if (user.role !== "manager") {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("projects")
      .insert([
        {
          title,
          description,
          created_by: user.email,
        },
      ])
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
      action: "CREATE",
      entity: "project",
      entityId: data.id,
      details: { title },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 401 }
    );
  }
}