import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  icon: string | null;
  audience: string;
  active: boolean;
  sent_at: string;
}

const SEEN_KEY = "fitfusion-admin-push-seen";

const readSeen = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
};

const markSeen = (id: string) => {
  const next = Array.from(new Set([...readSeen(), id])).slice(-200);
  localStorage.setItem(SEEN_KEY, JSON.stringify(next));
};

/**
 * Delivers admin push broadcasts to every signed-in client in real time.
 * Shows a system notification when the user granted permission and always
 * surfaces an in-app toast as a fallback.
 */
export function useAdminNotifications() {
  const { user } = useEnhancedAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [beta, setBeta] = useState(false);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("beta_opt_in")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setBeta(Boolean(data?.beta_opt_in));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const matches = useCallback(
    (n: AdminNotification) =>
      n.active &&
      (n.audience === "all" ||
        (n.audience === "beta" && beta) ||
        (n.audience === "admins" && isAdmin)),
    [beta, isAdmin],
  );

  const present = useCallback(
    (n: AdminNotification) => {
      if (readSeen().includes(n.id)) return;
      markSeen(n.id);
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          const notif = new Notification(n.title, {
            body: n.body,
            icon: n.icon || "/icons/icon-192.png",
            tag: n.id,
          });
          notif.onclick = () => {
            window.focus();
            if (n.link) window.location.assign(n.link);
          };
          return;
        }
      } catch {
        /* fall through to toast */
      }
      toast({ title: n.title, description: n.body });
    },
    [toast],
  );

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .eq("active", true)
      .order("sent_at", { ascending: false })
      .limit(30);
    const rows = ((data ?? []) as AdminNotification[]).filter(matches);
    setItems(rows);

    // On the first load only mark history as seen so users are not spammed
    // with every past broadcast; afterwards new rows are announced.
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      const fresh = rows.filter((r) => Date.now() - new Date(r.sent_at).getTime() < 60_000);
      rows.forEach((r) => {
        if (!fresh.includes(r)) markSeen(r.id);
      });
      fresh.forEach(present);
      return;
    }
    rows.forEach(present);
  }, [matches, present]);

  useEffect(() => {
    if (!user) return;
    refresh();
    const channel = supabase
      .channel(`admin-push-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  return { notifications: items, refresh };
}

/** Invisible mount point so broadcasts reach users on every screen. */
export function AdminNotificationListener() {
  useAdminNotifications();
  return null;
}
