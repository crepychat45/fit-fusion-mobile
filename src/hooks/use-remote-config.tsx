import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureSwitch {
  feature_id: string;
  name: string;
  is_enabled: boolean;
  min_app_version: string | null;
  allowed_tiers: string[];
  description: string | null;
  updated_at: string;
}

export interface SiteContentRow {
  key: string;
  section: string;
  content: Record<string, unknown>;
  updated_at: string;
}

export interface RemoteRelease {
  id: string;
  version: string;
  channel: "stable" | "beta";
  mandatory: boolean;
  changelog: string[];
  download_url: string | null;
  published: boolean;
  is_active: boolean;
  title: string;
  created_at: string;
}

export interface RemoteConfigState {
  switches: Record<string, FeatureSwitch>;
  content: Record<string, SiteContentRow>;
  releases: RemoteRelease[];
  loading: boolean;
  refresh: () => Promise<void>;
  isFeatureEnabled: (featureId: string, fallback?: boolean) => boolean;
  maintenanceMode: boolean;
  getContent: <T = Record<string, unknown>>(key: string, fallback: T) => T;
}

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v)) : [];

const RemoteConfigContext = createContext<RemoteConfigState | null>(null);

export const RemoteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [switches, setSwitches] = useState<Record<string, FeatureSwitch>>({});
  const [content, setContent] = useState<Record<string, SiteContentRow>>({});
  const [releases, setReleases] = useState<RemoteRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    const [fs, sc, rel] = await Promise.all([
      supabase.from("feature_switches").select("*"),
      supabase.from("site_content").select("*"),
      supabase
        .from("app_releases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (!mounted.current) return;

    if (fs.data) {
      const map: Record<string, FeatureSwitch> = {};
      fs.data.forEach((f) => {
        map[f.feature_id] = {
          feature_id: f.feature_id,
          name: f.name,
          is_enabled: Boolean(f.is_enabled),
          min_app_version: f.min_app_version,
          allowed_tiers: toStringArray(f.allowed_tiers),
          description: f.description,
          updated_at: f.updated_at,
        };
      });
      setSwitches(map);
    }
    if (sc.data) {
      const map: Record<string, SiteContentRow> = {};
      sc.data.forEach((c) => {
        map[c.key] = {
          key: c.key,
          section: c.section,
          content: (c.content as Record<string, unknown>) ?? {},
          updated_at: c.updated_at,
        };
      });
      setContent(map);
    }
    if (rel.data) {
      setReleases(
        rel.data.map((r) => ({
          id: r.id,
          version: r.version,
          title: r.title,
          channel: (r.channel === "beta" ? "beta" : "stable") as "stable" | "beta",
          mandatory: Boolean(r.mandatory),
          changelog: toStringArray(r.changelog),
          download_url: r.download_url,
          published: r.published !== false,
          is_active: Boolean(r.is_active),
          created_at: r.created_at,
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();

    // Unique suffix: two subscribers on an identical channel name make Realtime
    // throw "cannot add postgres_changes callbacks after subscribe()".
    const channel = supabase
      .channel(`admin_global_broadcast-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "feature_switches" }, () =>
        refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () =>
        refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "app_releases" }, () =>
        refresh(),
      )
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const value = useMemo<RemoteConfigState>(() => {
    const isFeatureEnabled = (featureId: string, fallback = true) =>
      switches[featureId]?.is_enabled ?? fallback;
    return {
      switches,
      content,
      releases,
      loading,
      refresh,
      isFeatureEnabled,
      maintenanceMode: switches.maintenance_mode?.is_enabled ?? false,
      getContent: <T,>(key: string, fallback: T) =>
        (content[key]?.content as unknown as T) ?? fallback,
    };
  }, [switches, content, releases, loading, refresh]);

  return <RemoteConfigContext.Provider value={value}>{children}</RemoteConfigContext.Provider>;
};

const EMPTY: RemoteConfigState = {
  switches: {},
  content: {},
  releases: [],
  loading: true,
  refresh: async () => {},
  isFeatureEnabled: (_id: string, fallback = true) => fallback,
  maintenanceMode: false,
  getContent: <T,>(_key: string, fallback: T) => fallback,
};

export function useRemoteConfig(): RemoteConfigState {
  return useContext(RemoteConfigContext) ?? EMPTY;
}
