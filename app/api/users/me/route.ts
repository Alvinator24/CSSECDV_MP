import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcrypt";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const user = verifyToken(token);
  if (!user) throw new Error("Unauthorized");

  return user;
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const { data, error } = await supabaseServer
      .from("users")
      .select("email, firstname, lastname, role")
      .eq("email", user.email)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
                  .min(8, "Password must be at least 8 characters")
                  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                  "Password must include uppercase, lowercase, number, and special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();

    const body = await req.json();

    const parsed = updatePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const { data: dbUser } = await supabaseServer
      .from("users")
      .select("user_id, password")
      .eq("email", user.email)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, dbUser.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabaseServer
      .from("users")
      .update({ password: hashedPassword })
      .eq("user_id", dbUser.user_id);

    await logAudit({
      user: user.email,
      action: "UPDATE",
      entity: "password",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Password updated" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}