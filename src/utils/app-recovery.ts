type RecoveryAttemptState = {
  count: number;
  firstAttemptAt: number;
};

type RecoveryOptions = {
  startupTimeoutMs?: number;
};

const RECOVERY_STATE_KEY = "fitfusion:recovery-state";
const RECOVERY_URL_KEY = "fitfusion:recovery-url";
const MAX_RECOVERY_ATTEMPTS = 2;
const RECOVERY_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_STARTUP_TIMEOUT_MS = 14_000;

let installed = false;
let recovering = false;
let startupTimer: number | undefined;

const recoverableErrorPattern =
  /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk \d+ failed|ChunkLoadError|vite:preloadError|dynamically imported module|module script failed|already been declared|Identifier .* has already been declared|NetworkError|Load failed/i;

const readSessionValue = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeSessionValue = (key: string, value: string) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Session storage can be unavailable in strict privacy modes.
  }
};

const removeSessionValue = (key: string) => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures; recovery should still proceed.
  }
};

const getRecoveryState = (): RecoveryAttemptState => {
  const now = Date.now();
  const raw = readSessionValue(RECOVERY_STATE_KEY);

  if (!raw) return { count: 0, firstAttemptAt: now };

  try {
    const parsed = JSON.parse(raw) as RecoveryAttemptState;
    if (!parsed.firstAttemptAt || now - parsed.firstAttemptAt > RECOVERY_WINDOW_MS) {
      return { count: 0, firstAttemptAt: now };
    }
    return parsed;
  } catch {
    return { count: 0, firstAttemptAt: now };
  }
};

const setRecoveryState = (state: RecoveryAttemptState) => {
  writeSessionValue(RECOVERY_STATE_KEY, JSON.stringify(state));
};

const isSameOriginAppResource = (value: unknown): boolean => {
  const rawUrl =
    typeof value === "string"
      ? value
      : value instanceof Request
        ? value.url
        : value instanceof URL
          ? value.href
          : undefined;

  if (!rawUrl || typeof window === "undefined") return false;

  try {
    const url = new URL(rawUrl, window.location.href);
    if (url.origin !== window.location.origin) return false;

    return (
      url.pathname.startsWith("/assets/") ||
      url.pathname.startsWith("/src/") ||
      /\.(css|js|jsx|mjs|ts|tsx|map)$/i.test(url.pathname) ||
      url.searchParams.has("import") ||
      url.searchParams.has("worker_file")
    );
  } catch {
    return false;
  }
};

const renderRecoveryFallback = (reason: string) => {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:hsl(var(--background));color:hsl(var(--foreground));font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center;">
      <div style="max-width:420px;width:100%;border:1px solid hsl(var(--border) / 0.35);background:hsl(var(--card) / 0.72);border-radius:16px;padding:24px;backdrop-filter:blur(16px);box-shadow:0 24px 80px hsl(var(--primary) / 0.16);">
        <div style="width:42px;height:42px;margin:0 auto 14px;border:3px solid hsl(var(--primary) / 0.45);border-top-color:hsl(var(--primary));border-radius:999px;animation:spin .8s linear infinite;"></div>
        <h1 style="font-size:20px;line-height:1.25;margin:0 0 8px;font-weight:700;">FitFusion recovery paused</h1>
        <p style="margin:0 0 16px;color:hsl(var(--muted-foreground));font-size:14px;line-height:1.5;">Automatic recovery already ran. Reload once your connection is stable.</p>
        <button id="fitfusion-manual-reload" style="height:42px;width:100%;border:0;border-radius:12px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:700;cursor:pointer;">Reload app</button>
        <p style="margin:12px 0 0;color:hsl(var(--muted-foreground));font-size:11px;">Reason: ${reason.replace(/[<>&"]/g, "")}</p>
      </div>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  `;

  document.getElementById("fitfusion-manual-reload")?.addEventListener("click", () => {
    removeSessionValue(RECOVERY_STATE_KEY);
    window.location.reload();
  });
};

export const isRecoverableResourceError = (error: unknown): boolean => {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === "string"
        ? error
        : JSON.stringify(error ?? "");

  return recoverableErrorPattern.test(message);
};

export const clearAppCaches = async () => {
  const operations: Promise<unknown>[] = [];

  if ("serviceWorker" in navigator) {
    operations.push(
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))),
    );
  }

  if ("caches" in window) {
    operations.push(
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => /fitfusion|vite|workbox|precache|runtime|static|dynamic/i.test(key))
            .map((key) => caches.delete(key)),
        ),
      ),
    );
  }

  await Promise.allSettled(operations);
};

export const recoverApp = async (reason: string, error?: unknown) => {
  if (typeof window === "undefined" || recovering) return;

  recovering = true;
  const state = getRecoveryState();

  if (state.count >= MAX_RECOVERY_ATTEMPTS) {
    console.error("[FitFusion Recovery] Recovery limit reached", { reason, error });
    renderRecoveryFallback(reason);
    return;
  }

  const nextState = {
    count: state.count + 1,
    firstAttemptAt: state.firstAttemptAt || Date.now(),
  };

  setRecoveryState(nextState);
  writeSessionValue(RECOVERY_URL_KEY, window.location.href);

  console.warn("[FitFusion Recovery] Clearing app caches and reloading", {
    reason,
    attempt: nextState.count,
    error,
  });

  await clearAppCaches();

  const url = new URL(window.location.href);
  url.searchParams.set("__fitfusion_recovery", String(Date.now()));
  window.location.replace(url.toString());
};

export const markAppReady = () => {
  if (startupTimer) {
    window.clearTimeout(startupTimer);
    startupTimer = undefined;
  }

  window.setTimeout(() => {
    removeSessionValue(RECOVERY_STATE_KEY);
    removeSessionValue(RECOVERY_URL_KEY);
  }, 8_000);
};

const installFetchRecovery = () => {
  const key = "__fitfusionFetchRecoveryInstalled";
  if ((window as any)[key]) return;

  (window as any)[key] = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      const request = args[0];
      const shouldRecover =
        isSameOriginAppResource(request) &&
        [404, 408, 409, 410, 425, 429, 500, 502, 503, 504].includes(response.status);

      if (shouldRecover) {
        void recoverApp(`app resource fetch failed (${response.status})`, request);
      }

      return response;
    } catch (error) {
      if (isSameOriginAppResource(args[0]) || isRecoverableResourceError(error)) {
        void recoverApp("app resource fetch rejected", error);
      }
      throw error;
    }
  };
};

export const installAppRecovery = (options: RecoveryOptions = {}) => {
  if (typeof window === "undefined" || installed) return;
  installed = true;

  installFetchRecovery();

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    void recoverApp("vite preload error", (event as unknown as { payload?: unknown }).payload);
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (isRecoverableResourceError(event.reason)) {
      event.preventDefault();
      void recoverApp("unhandled chunk import rejection", event.reason);
    }
  });

  window.addEventListener(
    "error",
    (event) => {
      const target = event.target as HTMLScriptElement | HTMLLinkElement | null;
      const resourceUrl =
        target instanceof HTMLScriptElement
          ? target.src
          : target instanceof HTMLLinkElement
            ? target.href
            : undefined;

      if (resourceUrl && isSameOriginAppResource(resourceUrl)) {
        void recoverApp("script or stylesheet failed to load", resourceUrl);
        return;
      }

      if (isRecoverableResourceError(event.error || event.message)) {
        event.preventDefault();
        void recoverApp("runtime module error", event.error || event.message);
      }
    },
    true,
  );

  startupTimer = window.setTimeout(() => {
    void recoverApp("startup timed out before route became ready");
  }, options.startupTimeoutMs ?? DEFAULT_STARTUP_TIMEOUT_MS);
};

declare global {
  interface Window {
    __fitfusionRecovery?: {
      clearCaches: typeof clearAppCaches;
      markReady: typeof markAppReady;
      recover: typeof recoverApp;
    };
  }
}

if (typeof window !== "undefined") {
  window.__fitfusionRecovery = {
    clearCaches: clearAppCaches,
    markReady: markAppReady,
    recover: recoverApp,
  };
}