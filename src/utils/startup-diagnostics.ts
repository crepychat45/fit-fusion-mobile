/**
 * Startup Diagnostics
 * Runs lightweight health checks at app boot and logs results.
 * Exposes window.__fitfusionDiagnostics() for on-demand re-runs.
 */
import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticResult {
  name: string;
  ok: boolean;
  detail?: string;
  durationMs?: number;
}

const time = async <T>(fn: () => Promise<T> | T): Promise<{ value: T; durationMs: number }> => {
  const start = performance.now();
  const value = await fn();
  return { value, durationMs: Math.round(performance.now() - start) };
};

export async function runStartupDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // 1. Environment variables
  results.push({
    name: "Env: Supabase URL",
    ok: Boolean(import.meta.env.VITE_SUPABASE_URL),
    detail: import.meta.env.VITE_SUPABASE_URL ? "present" : "missing VITE_SUPABASE_URL",
  });
  results.push({
    name: "Env: Supabase Key",
    ok: Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
    detail: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "present" : "missing key",
  });

  // 2. Storage available
  try {
    const k = "__fitfusion_diag__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    results.push({ name: "LocalStorage", ok: true });
  } catch (e: any) {
    results.push({ name: "LocalStorage", ok: false, detail: e?.message ?? "unavailable" });
  }

  // 3. Network reachability (Supabase auth endpoint)
  try {
    const { durationMs } = await time(async () => {
      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), 4000);
      try {
        await supabase.auth.getSession();
      } finally {
        clearTimeout(timeout);
      }
    });
    results.push({ name: "Auth: getSession", ok: true, durationMs });
  } catch (e: any) {
    results.push({ name: "Auth: getSession", ok: false, detail: e?.message ?? "failed" });
  }

  // 4. Service worker hygiene
  results.push({
    name: "ServiceWorker",
    ok: true,
    detail: "serviceWorker" in navigator ? "available" : "unsupported",
  });

  const failed = results.filter((r) => !r.ok);
  if (failed.length === 0) {
    console.info("[FitFusion Diagnostics] ✅ All checks passed", results);
  } else {
    console.warn("[FitFusion Diagnostics] ⚠️ Issues found", failed, "Full report:", results);
  }

  return results;
}

if (typeof window !== "undefined") {
  (window as any).__fitfusionDiagnostics = runStartupDiagnostics;
}
