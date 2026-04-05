import { supabaseServer } from "@/lib/supabase";

export async function logAudit({
  user,
  action,
  entity,
  entityId,
  details,
}: {
  user: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
}) {
  const { error } = await supabaseServer.from("logs").insert([
    {
      user: user,
      action,
      entity,
      entity_id: entityId,
      details,
    },
  ]);

  if (error) {
    console.error("Failed to log audit:", error)
  }
}