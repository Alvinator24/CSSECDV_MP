// app/manager/project/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import ProjectPageClient from "./ProjectPageClient";

export default async function ProjectPage({ params }: { params: { id: string }; }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const user = token ? verifyToken(token) : null;

  if (!user) redirect("/");
  if (user.role !== "manager") redirect(`/${user.role}`);

  return <ProjectPageClient projectId={params.id} />;
}