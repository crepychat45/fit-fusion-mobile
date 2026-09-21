import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { useAppReleases, type AppRelease } from "@/hooks/use-admin-sync";
import { APP_VERSION } from "@/lib/app-version";
import { getStoredVersion } from "@/config/version";

export const cleanVersion = (v: string | null | undefined) =>
  (v ?? "").toString().trim().replace(/^v/i, "");

/** Semver-ish compare. Returns 1 if a > b, -1 if a < b, 0 when equal. */
export function compareVersions(a: string, b: string): number {
  const pa = cleanVersion(a).split(".").map((n) => parseInt(n, 10) || 0);
  const pb = cleanVersion(b).split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

export interface RemoteUpdateState {
  /** Version currently installed on this device. */
  installed: string;
  /** Highest version available (remote release or the bundled build). */
  target: string;
  /** The remote release driving the update, when it is newer than the build. */
  release: AppRelease | null;
  /** Changelog lines for the target version. */
  changelog: string[];
  title: string;
  mandatory: boolean;
  downloadUrl: string | null;
  channel: string;
  hasUpdate: boolean;
  betaOptIn: boolean;
  loading: boolean;
}

/**
 * Single source of truth for "is there an update?".
 * Combines the bundled build version with the newest release an admin published.
 */
export function useRemoteUpdate(): RemoteUpdateState {
  const { user } = useEnhancedAuth();
  const [betaOptIn, setBetaOptIn] = useState(false);
  const [installed, setInstalled] = useState(() => cleanVersion(getStoredVersion()));

  useEffect(() => {
    const sync = () => setInstalled(cleanVersion(getStoredVersion()));
    window.addEventListener("versionUpdated", sync as EventListener);
    return () => window.removeEventListener("versionUpdated", sync as EventListener);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("beta_opt_in")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setBetaOptIn(Boolean(data?.beta_opt_in));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const { releases, loading } = useAppReleases(betaOptIn);

  return useMemo(() => {
    const published = releases.filter((r) => r.is_active && (r as { published?: boolean }).published !== false);
    const newest = published
      .slice()
      .sort((a, b) => compareVersions(b.version, a.version))[0] ?? null;

    const remoteNewer = newest && compareVersions(newest.version, APP_VERSION) > 0;
    const release = remoteNewer ? newest : null;
    const target = cleanVersion(release ? release.version : APP_VERSION);

    return {
      installed,
      target,
      release,
      changelog: release?.changelog ?? [],
      title: release?.title || `FitxFusion ${target}`,
      mandatory: Boolean(release?.mandatory),
      downloadUrl: release?.download_url ?? null,
      channel: release?.channel ?? "stable",
      hasUpdate: compareVersions(target, installed) > 0,
      betaOptIn,
      loading,
    };
  }, [releases, installed, betaOptIn, loading]);
}

/** Imperative refresh used by manual "check for updates" buttons. */
export function useUpdateChecker() {
  return useCallback(async () => {
    try {
      const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
      await reg?.update();
    } catch {
      /* offline or unsupported */
    }
  }, []);
}
