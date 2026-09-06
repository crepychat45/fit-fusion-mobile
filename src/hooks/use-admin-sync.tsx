import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppRelease {
  id: string;
  version: string;
  min_version: string | null;
  channel: "stable" | "beta";
  title: string;
  changelog: string[];
  mandatory: boolean;
  download_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FeatureFlag {
  key: string;
  is_enabled: boolean;
  description: string | null;
  allowed_roles: string[];
}

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical";
  active: boolean;
  created_at: string;
}

const toChangelog = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v)) : [];

export interface AdminSyncState {
  releases: AppRelease[];
  flags: Record<string, FeatureFlag>;
  announcements: GlobalAnnouncement[];
  loading: boolean;
  refresh: () => Promise<void>;
  isFlagEnabled: (key: string, fallback?: boolean) => boolean;
}

/**
 * Live remote configuration: releases, feature flags and announcements.
 * Subscribes to Supabase Realtime so admin changes land instantly.
 */
export function useAdminSync(): AdminSyncState {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});
  const [announcements, setAnnouncements] = useState<GlobalAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [rel, ff, ann] = await Promise.all([
      supabase.from("app_releases").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("feature_flags").select("*"),
      supabase
        .from("global_announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (rel.data) {
      setReleases(
        rel.data.map((r) => ({
          ...r,
          channel: (r.channel === "beta" ? "beta" : "stable") as "stable" | "beta",
          changelog: toChangelog(r.changelog),
        })) as AppRelease[],
      );
    }
    if (ff.data) {
      const map: Record<string, FeatureFlag> = {};
      ff.data.forEach((f) => {
        map[f.key] = {
          key: f.key,
          is_enabled: f.is_enabled,
          description: f.description,
          allowed_roles: (f.allowed_roles as string[]) ?? [],
        };
      });
      setFlags(map);
    }
    if (ann.data) setAnnouncements(ann.data as GlobalAnnouncement[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("admin-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_releases" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "feature_flags" }, () => refresh())
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "global_announcements" },
        () => refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const isFlagEnabled = useCallback(
    (key: string, fallback = false) => flags[key]?.is_enabled ?? fallback,
    [flags],
  );

  return { releases, flags, announcements, loading, refresh, isFlagEnabled };
}

/** Convenience hook for the client update drawer. */
export function useAppReleases(betaOptIn = false) {
  const { releases, loading } = useAdminSync();
  const visible = releases.filter(
    (r) => r.is_active && (r.channel === "stable" || betaOptIn),
  );
  return { releases: visible, latest: visible[0] ?? null, loading };
}
