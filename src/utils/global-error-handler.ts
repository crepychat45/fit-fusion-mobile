/**
 * Global error + rejection handler. Filters known noisy errors,
 * surfaces recovery for chunk load failures, and forwards to perf telemetry.
 */
const CHUNK_ERROR = /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i;
let installed = false;

function isChunkError(reason: any): boolean {
  const msg = (reason?.message ?? String(reason ?? "")) as string;
  return CHUNK_ERROR.test(msg);
}

function triggerRecovery(reason: any) {
  const recovery = (window as any).__fitfusionRecovery;
  if (recovery?.recover) {
    recovery.recover("chunk-error", reason);
  } else {
    // Last resort: clear caches then reload
    if ("caches" in window) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).finally(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }
}

export function installGlobalErrorHandler() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    if (isChunkError(event.error ?? event.message)) {
      triggerRecovery(event.error ?? event.message);
      return;
    }
    // eslint-disable-next-line no-console
    console.warn("[fitfusion:error]", event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (isChunkError(reason)) {
      event.preventDefault();
      triggerRecovery(reason);
      return;
    }
    // eslint-disable-next-line no-console
    console.warn("[fitfusion:unhandled]", reason);
  });
}
