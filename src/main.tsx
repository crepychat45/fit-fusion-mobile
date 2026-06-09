import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installAppRecovery } from "@/utils/app-recovery";

// Defer non-critical initialization until after first paint to speed up startup
if (typeof window !== "undefined") {
  const loadInit = () => import("@/utils/app-initializer").catch(() => undefined);
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(loadInit, { timeout: 2000 });
  } else {
    window.setTimeout(loadInit, 1500);
  }
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
