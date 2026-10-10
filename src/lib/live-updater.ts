import { APP_VERSION } from "@/lib/app-version";

export const CURRENT_BUILD_ID: string = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "dev";

export interface DeployedBuild { version: string; buildId: string; builtAt: string }

/** Reads the build manifest the server is actually serving right now. */
export async function fetchDeployedBuild(): Promise<DeployedBuild | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const j = await res.json();
    return typeof j?.buildId === "string" ? j : null;
  } catch { return null; }
}

export function isNewer(d: DeployedBuild | null) {
  return !!d && d.buildId !== CURRENT_BUILD_ID;
}

/** Downloads the new service worker, waits for it to install, activates it and reloads. */
export async function downloadAndInstall(onStep: (s: "downloading" | "installing" | "restarting") => void) {
  onStep("downloading");
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (reg) {
    await reg.update();
    const worker = reg.waiting ?? (await new Promise<ServiceWorker | null>((resolve) => {
      const nw = reg.installing;
      if (!nw) return resolve(reg.waiting);
      onStep("installing");
      nw.addEventListener("statechange", () => {
        if (nw.state === "installed") resolve(nw);
        if (nw.state === "redundant") resolve(null);
      });
      setTimeout(() => resolve(reg.waiting), 30_000);
    }));
    if (worker) {
      onStep("installing");
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
        worker.postMessage({ type: "SKIP_WAITING" });
        setTimeout(resolve, 5_000);
      });
    }
  }
  onStep("restarting");
  // Hard reload so the freshly deployed files are loaded.
  window.location.reload();
}

export { APP_VERSION };
