import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { supabaseServer } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data: user } = await supabaseServer
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  await logAudit({
    user: user.email,
    action: "LOGIN",
    entity: "auth",
  });

  const res = NextResponse.json({ message: "Logged in", role: user.role });
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 3600, // 1 hour
  });

  return res;
}