import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";
import { z } from "zod";
import bcrypt from "bcrypt";

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

async function requireAuth(req: Request, allowedRoles: string[] = []) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("Unauthorized");

  const user = verifyToken(token);
  if (!user) throw new Error("Unauthorized");

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}

export async function GET(req: Request) {
  try {
    await requireAuth(req, ["admin", "manager"]);
    const { data, error } = await supabaseServer
      .from("users")
      .select("firstname, lastname, email, role")

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
    await requireAuth(req, ["admin"]);
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