/**
 * Cache Manager — client-side control over the FitFusion Service Worker caches.
 * Uses postMessage with a MessageChannel so callers get a promise-based API.
 */
export interface CacheStat {
  name: string;
  entries: number;
}

export interface CacheInfo {
  ok: boolean;
  version?: string;
  caches: CacheStat[];
  storage?: { usage: number; quota: number; percent: number };
}

function ask<T>(type: string): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      reject(new Error("no-active-service-worker"));
      return;
    }
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => reject(new Error("sw-timeout")), 4000);
    channel.port1.onmessage = (e) => {
      window.clearTimeout(timeout);
      resolve(e.data as T);
    };
    navigator.serviceWorker.controller.postMessage({ type }, [channel.port2]);
  });
}

export async function getCacheInfo(): Promise<CacheInfo> {
  let base: CacheInfo = { ok: false, caches: [] };
  try {
    base = await ask<CacheInfo>("GET_CACHE_INFO");
  } catch {
    // Fallback: enumerate directly from window
    if ("caches" in window) {
      const names = await caches.keys();
      const stats = await Promise.all(
        names.map(async (name) => ({
          name,
          entries: (await (await caches.open(name)).keys()).length,
        })),
      );
      base = { ok: true, caches: stats };
    }
  }
  if ("storage" in navigator && navigator.storage.estimate) {
    try {
      const e = await navigator.storage.estimate();
      const usage = e.usage ?? 0;
      const quota = e.quota ?? 0;
      base.storage = {
        usage,
        quota,
        percent: quota ? (usage / quota) * 100 : 0,
      };
    } catch { /* noop */ }
  }
  return base;
}

export async function clearAllCaches(): Promise<number> {
  try {
    const res = await ask<{ ok: boolean; cleared: number }>("CLEAR_CACHES");
    return res.cleared;
  } catch {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      return names.length;
    }
    return 0;
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}
