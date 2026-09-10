import { supabase } from "@/integrations/supabase/client";

/** Records an admin action in the audit trail. Never throws. */
export async function logAdminAction(
  action: string,
  target?: string | null,
  details: Record<string, unknown> = {},
) {
  try {
    const { data } = await supabase.auth.getUser();
    const actorId = data.user?.id;
    if (!actorId) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: actorId,
      action,
      target: target ?? null,
      details: details as never,
    });
  } catch {
    /* auditing must never block an admin action */
  }
}
