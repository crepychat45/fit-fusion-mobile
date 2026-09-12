import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { useAdmin } from "@/hooks/use-admin";
import {
  addLocalNotification,
  clearNotifications,
  getClearedIds,
  getLocalNotifications,
  getReadIds,
  markRead,
  subscribeInbox,
  type InboxCategory,
} from "@/lib/notification-store";

export interface InboxItem {
  id: string;
  title: string;
  body: string;
  category: InboxCategory;
  link: string | null;
  createdAt: string;
  read: boolean;
}

const byNewest = (a: InboxItem, b: InboxItem) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/**
 * Unified notification inbox: admin broadcasts, global announcements, new app
 * releases, push messages received in-app and locally generated alerts.
 */
export function useNotificationInbox() {
  const { user } = useEnhancedAuth();
  const { isAdmin } = useAdmin();
  const [remote, setRemote] = useState<Omit<InboxItem, "read">[]>([]);
  const [tick, setTick] = useState(0);
  const [beta, setBeta] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeInbox(() => setTick((t) => t + 1)), []);

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

  const refresh = useCallback(async () => {
    const [adminRes, annRes, relRes] = await Promise.all([
      supabase
        .from("admin_notifications")
        .select("id,title,body,link,audience,active,sent_at")
        .eq("active", true)
        .order("sent_at", { ascending: false })
        .limit(30),
      supabase
        .from("global_announcements")
        .select("id,title,message,type,active,created_at")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("app_releases")
        .select("id,version,title,channel,is_active,published,created_at")
        .eq("published", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const items: Omit<InboxItem, "read">[] = [];

    for (const n of adminRes.data ?? []) {
      const audienceOk =
        n.audience === "all" ||
        (n.audience === "beta" && beta) ||
        (n.audience === "admins" && isAdmin);
      if (!audienceOk) continue;
      items.push({
        id: `admin-${n.id}`,
        title: n.title,
        body: n.body,
        category: "admin",
        link: n.link ?? null,
        createdAt: n.sent_at,
      });
    }

    for (const a of annRes.data ?? []) {
      items.push({
        id: `announcement-${a.id}`,
        title: a.title,
        body: a.message,
        category: "announcement",
        link: null,
        createdAt: a.created_at,
      });
    }

    for (const r of relRes.data ?? []) {
      items.push({
        id: `release-${r.id}`,
        title: `Update available — v${r.version}`,
        body: r.title || `A new ${r.channel} update is ready to install.`,
        category: "update",
        link: "/settings?tab=updates",
        createdAt: r.created_at,
      });
    }

    setRemote(items);
    setLoading(false);
  }, [beta, isAdmin]);

  useEffect(() => {
    refresh();
    if (!user) return;
    const suffix = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`inbox-${suffix}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "global_announcements" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_releases" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  // Push messages delivered by the service worker while the app is open.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "PUSH_RECEIVED") return;
      addLocalNotification({
        title: data.title || "FitXFusion",
        body: data.body || "",
        category: "push",
        link: data.url ?? null,
      });
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  const items = useMemo(() => {
    void tick;
    const readIds = new Set(getReadIds());
    const cleared = new Set(getClearedIds());
    const local: Omit<InboxItem, "read">[] = getLocalNotifications().map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      category: n.category,
      link: n.link ?? null,
      createdAt: n.createdAt,
    }));
    return [...remote, ...local]
      .filter((n) => !cleared.has(n.id))
      .map((n) => ({ ...n, read: readIds.has(n.id) }))
      .sort(byNewest);
  }, [remote, tick]);

  const unreadCount = items.filter((i) => !i.read).length;

  return {
    items,
    unreadCount,
    loading,
    refresh,
    markRead: (id: string) => markRead(id),
    markAllRead: () => markRead(items.map((i) => i.id)),
    clearAll: () => clearNotifications(items.map((i) => i.id)),
    remove: (id: string) => clearNotifications([id]),
  };
}
