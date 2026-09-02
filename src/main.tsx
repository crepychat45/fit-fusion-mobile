import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/utils/perf-telemetry";
import { mark } from "@/utils/perf-telemetry";
import { installAppRecovery } from "@/utils/app-recovery";
import { installGlobalErrorHandler } from "@/utils/global-error-handler";

installGlobalErrorHandler();

/**
 * Run work right after the first frame is on screen. Keeping permission
 * guards, the settings cloud mirror and origin warm-up off the critical path
 * removes their parse + network cost from time-to-first-paint.
 */
const afterFirstPaint = (task: () => void) => {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => window.setTimeout(task, 0));
};

afterFirstPaint(() => {
  import("@/lib/permissions")
    .then((m) => m.installPermissionGuards())
    .catch(() => undefined);

  // Cloud mirror: localStorage writes from Settings are pushed to the backend
  // and restored on sign-in. Only needed once the UI is interactive.
  import("@/utils/local-storage-sync")
    .then((m) => m.initSettingsCloudMirror())
    .catch(() => undefined);

  // Warm DNS/TLS to the API + media CDNs so the first real request skips
  // the handshake cost — the single biggest perceived-latency win on mobile.
  import("@/utils/network-adaptive")
    .then(({ isTurboEnabled, warmCriticalOrigins }) => {
      if (isTurboEnabled()) warmCriticalOrigins();
    })
    .catch(() => undefined);
});

mark("main-tsx-start");


// Defer non-critical initialization until after first paint to speed up startup
if (typeof window !== "undefined") {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number };
  const loadInit = () => import("@/utils/app-initializer").catch(() => undefined);
  if (typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(loadInit, { timeout: 2000 });
  } else {
    window.setTimeout(loadInit, 1500);
  }
}

// Restore Display Lab preferences early and wire reading-ruler cursor tracking.
if (typeof window !== "undefined") {
  try {
    const density = localStorage.getItem("fitfusion-density");
    if (density) document.documentElement.dataset.density = density;
    const ruler = localStorage.getItem("fitfusion-reading-ruler") === "1";
    if (ruler) document.documentElement.classList.add("reading-ruler");
    const font = localStorage.getItem("fitfusion-font-family");
    if (font) document.documentElement.style.setProperty("--font-family", font);
  } catch { /* storage disabled */ }
  // rAF-batched so pointer moves never trigger a synchronous style/layout pass.
  let rulerY = 0;
  let rulerQueued = false;
  const flushRuler = () => {
    rulerQueued = false;
    document.documentElement.style.setProperty("--ruler-y", `${rulerY}px`);
  };
  window.addEventListener("mousemove", (e) => {
    if (!document.documentElement.classList.contains("reading-ruler")) return;
    rulerY = e.clientY - 14;
    if (rulerQueued) return;
    rulerQueued = true;
    requestAnimationFrame(flushRuler);
  }, { passive: true });

}

installAppRecovery({ startupTimeoutMs: 14_000 });

const StartupErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
    <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card/80 p-6 text-center shadow-xl backdrop-blur-xl">
      <h1 className="text-xl font-bold">FitFusion could not start</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A frontend module failed during startup. Clear the app cache and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 h-11 w-full rounded-xl bg-primary text-primary-foreground font-semibold"
      >
        Reload app
      </button>
    </div>
  </div>
);

const container = document.getElementById("root");
if (container) {
  const root = (window as any).__fitfusionRoot ?? createRoot(container);
  (window as any).__fitfusionRoot = root;
  try {
    root.render(<App />);
    window.setTimeout(() => {
      import("./utils/startup-diagnostics")
        .then((m) => m.runStartupDiagnostics())
        .catch(() => undefined);
    }, 2500);
  } catch (error) {
    console.error("[FitFusion Startup] App bootstrap failed", error);
    root.render(<StartupErrorFallback onRetry={() => window.__fitfusionRecovery?.recover("manual startup retry", error) ?? window.location.reload()} />);
  }
}
