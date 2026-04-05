import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import AdminPanelClient from "./AdminPanelClient";
import { logAudit } from "@/lib/audit";

export default async function AdminPanel() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const user = token ? verifyToken(token) : null;

  if (!user || typeof user === "string" || !("role" in user)) {
    redirect("/");
  }

  if (user.role !== "admin") {
    await logAudit({
        user: user.email,
        action: "ACCESS_DENIED",
        entity: "auth",
        details: {
          reason: "Accessing pages that are not for your role is prohibited"
        },
      });
    redirect(`/${user.role}`);
  }

  return <AdminPanelClient />;
}