import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsers() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/");
  }

  return <AdminUsersClient />;
}