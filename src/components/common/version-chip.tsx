import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_VERSION } from "@/lib/app-version";

/** Small always-visible version pill. Shows "Update ready" only when a deployed build is actually waiting. */
export function VersionChip() {
  const navigate = useNavigate();
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let reg: ServiceWorkerRegistration | undefined;
    const check = () => setWaiting(Boolean(reg?.waiting));
    navigator.serviceWorker.getRegistration().then((r) => {
      reg = r;
      check();
      r?.addEventListener("updatefound", () => {
        r.installing?.addEventListener("statechange", check);
      });
    });
    const t = window.setInterval(check, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <button
      type="button"
      onClick={() => navigate("/settings?tab=updates")}
      aria-label={waiting ? "App update ready, open updates" : `FitFusion version ${APP_VERSION}`}
      className={`fixed z-40 left-2 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] md:bottom-3 rounded-full border px-2 py-0.5 text-[10px] font-mono backdrop-blur-md shadow-sm transition-colors ${
        waiting ? "bg-primary text-primary-foreground border-primary animate-pulse" : "bg-background/60 text-muted-foreground border-border/40"
      }`}
    >
      v{APP_VERSION}
      {waiting && " · Update ready"}
    </button>
  );
}
