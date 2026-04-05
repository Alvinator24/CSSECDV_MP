import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { supabaseServer } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcrypt";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 5;

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data: user } = await supabaseServer
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const now = new Date();

  if (user.lock_until && new Date(user.lock_until) > now) {
    return NextResponse.json(
      { error: "Account has been locked. Try again in 1 hour." },
      { status: 403 }
    );
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    const failedAttempts = (user.failed_attempts || 0) + 1;
    const updates: any = { failed_attempts: failedAttempts };

    if (failedAttempts >= MAX_ATTEMPTS) {
      const lockUntil = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);
      updates.lock_until = lockUntil.toISOString();
      updates.failed_attempts = 0; // reset attempts after locking
    }

    const { error: updateError } = await supabaseServer
      .from("users")
      .update(updates)
      .eq("email", email);

    if (updateError) console.error("Failed to update login attempts:", updateError.message);

    await logAudit({
      user: user.email,
      action: "FAILED_LOGIN",
      entity: "auth",
      details: {
        failedAttempts,
        locked: failedAttempts >= MAX_ATTEMPTS,
      },
    });

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  const rightNow = new Date();
  const gmt8Time = new Date(rightNow.getTime() + 8 * 60 * 60 * 1000)

  await supabaseServer
    .from("users")
    .update({ failed_attempts: 0, lock_until: null, last_login_at: gmt8Time.toISOString() })
    .eq("email", email);

  await logAudit({ user: user.email, action: "LOGIN", entity: "auth" });

  const res = NextResponse.json({ message: "Logged in", role: user.role, last_login: user.last_login_at });
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 3600,
  });

  return res;
}