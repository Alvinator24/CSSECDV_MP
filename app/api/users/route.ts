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
  role: z.string("Must be a valid role"),
  favoriteSong: z.string()
});

export async function GET() {
  try {
    const user = await requireAuth();

    if (!["admin", "manager"].includes(user.role)) {
      await logAudit({
        user: user.email,
        action: "ACCESS_DENIED",
        entity: "auth",
        details: {
          reason: "Accessing an API without authorization is prohibited"
        },
      });
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

    console.log(user.role)

    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (!result.success) {
      await logAudit({
        user: user.email,
        action: "FAILED_ACCOUNT_CREATION",
        entity: "auth",
        details: {
          reason: "Input validation failed",
          errors: result.error.issues
        },
      });
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const { firstname, lastname, email, password, role, favoriteSong } = result.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseServer
      .from("users")
      .insert([
        {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          role,
          song: favoriteSong.toLowerCase()
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

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await req.json();

    const { data: oldUser, error: fetchError } = await supabaseServer
      .from("users")
      .select("email, role, user_id")
      .eq("email", email)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { data: updatedUser, error: updateError } = await supabaseServer
      .from("users")
      .update({ role })
      .eq("email", email)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const changes: Record<string, { old: any; new: any }> = {};
    if (oldUser.role !== updatedUser.role) {
      changes.role = { old: oldUser.role, new: updatedUser.role };
    }

    if (Object.keys(changes).length > 0) {
      await logAudit({
        user: user.email,
        action: "UPDATE",
        entity: "user",
        entityId: updatedUser.id,
        details: changes,
      });
    }

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {

    const user = await requireAuth();

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const { email } = body;

    const { data: oldUser, error: fetchError } = await supabaseServer
      .from("users")
      .select("user_id, firstname, lastname, email")
      .eq("email", email)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error: deleteError } = await supabaseServer
      .from("users")
      .delete()
      .eq("email", email);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await logAudit({
      user: user.email,
      action: "DELETE",
      entity: "user",
      entityId: oldUser.user_id,
      details: oldUser,
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}