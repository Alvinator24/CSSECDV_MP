import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { z } from "zod";
import bcrypt from "bcrypt";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const createUserSchema = z.object({
  email: z.email("Invalid email"),
  firstname: z.string().min(2, "Name must be at least 2 characters"),
  lastname: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string()
              .min(8, "Password must be at least 8 characters")
              .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
              "Password must include uppercase, lowercase, number, and special character"),
  role: z.string("Must be a valid role")
});

export async function GET() {
  try {
    const user = await requireAuth();

    if (!["admin", "manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let query = supabaseServer.from("users").select("firstname, lastname, email, role");
    if (user.role === "manager") {
      query = query.eq("role", "developer");
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const { firstname, lastname, email, password, role } = result.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseServer
      .from("users")
      .insert([
        {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          role
        },
      ])
      .select()
      .single();

    await logAudit({
      user: user.email,
      action: "CREATE",
      entity: "new user",
      details: { firstname, lastname, email },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}