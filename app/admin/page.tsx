import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import AdminPanelClient from "./AdminPanelClient";

export default async function AdminPanel() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const user = token ? verifyToken(token) : null;

  if (!user || typeof user === "string" || !("role" in user)) {
    redirect("/");
  }

  if (user.role !== "admin") {
    redirect(`/${user.role}`);
  }

  return <AdminPanelClient />;
}