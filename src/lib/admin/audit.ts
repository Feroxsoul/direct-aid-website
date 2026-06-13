import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/types";

export async function logAuditEvent(
  profile: AdminProfile,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>,
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  await supabase.from("audit_logs").insert({
    actor_user_id: profile.user_id,
    actor_email: profile.email,
    action,
    resource_type: resourceType ?? null,
    resource_id: resourceId ?? null,
    details: details ?? {},
  });
}
