import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { logAudit } from "@/lib/audit";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let user = null;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded !== "string") {
        user = decoded;
      }
    }

    if (user) {
      await logAudit({
        user: user.email,
        action: "LOGOUT",
        entity: "auth"
      });
    }

    const res = NextResponse.json({ message: "Logged out" });

    res.cookies.set({
      name: "token",
      value: "",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Logout failed" },
      { status: 500 }
    );
  }
}