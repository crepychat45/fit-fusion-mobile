import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";

export interface AdminState {
  isAdmin: boolean;
  checking: boolean;
  userId: string | null;
}

/**
 * Verifies the current session's role from the secure `user_roles` table.
 * Roles are never read from local storage or the profile row.
 */
export function useAdmin(): AdminState {
  const { user, loading } = useEnhancedAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (loading) return;
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    setChecking(true);
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      setIsAdmin(!error && Boolean(data));
      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return { isAdmin, checking: loading || checking, userId: user?.id ?? null };
}
