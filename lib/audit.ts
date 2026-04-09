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

  const nowUTC = Date.now();
  const gmt8Offset = 8 * 60 * 60 * 1000;
  const gmt8Date = new Date(nowUTC + gmt8Offset)

  const { error } = await supabaseServer.from("logs").insert([
    {
      user: user,
      action,
      entity,
      entity_id: entityId,
      details,
      created_at: gmt8Date
    },
  ]);

  if (error) {
    console.error("Failed to log audit:", error)
  }
}