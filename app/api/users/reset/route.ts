import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { supabaseServer } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";

const resetPasswordSchema = z.object({
  newPassword: z.string()
  .min(8, "New password must be at least 8 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
  "New password must include uppercase, lowercase, number, and special character"),
});

export async function POST(req: Request) {
  try {

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      await logAudit({
            user: body.email,
            action: "FAILED_PASSWORD_UPDATE",
            entity: "auth",
            details: { reason: "Input validation failed", errors: parsed.error.issues },
          });
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { newPassword } = parsed.data;

    const { data: dbUser } = await supabaseServer
      .from("users")
      .select("password")
      .eq("email", body.email)
      .single();

    if (!dbUser) {
      await logAudit({
        user: "random_email",
        action: "FAILED_LOGIN",
        entity: "auth",
        details: { reason: "User does not exist" },
      });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isReuse = await bcrypt.compare(newPassword, dbUser.password);
    if (isReuse) {
      await logAudit({
        user: body.email,
        action: "FAILED_LOGIN",
        entity: "auth",
        details: { reason: "Current password incorrect" },
      });
      return NextResponse.json({ error: "Cannot reuse old password" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabaseServer
      .from("users")
      .update({ password: hashedPassword, password_updated_at: new Date().toISOString() })
      .eq("email", body.email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Password reset successfully!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}