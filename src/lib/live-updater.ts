import { APP_VERSION } from "@/lib/app-version";

export const CURRENT_BUILD_ID: string = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "dev";

export interface DeployedBuild { version: string; buildId: string; builtAt: string }

/** Reads the build manifest the server is actually serving right now. */
export async function fetchDeployedBuild(): Promise<DeployedBuild | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const j = await res.json();
    return typeof j?.buildId === "string" && typeof j?.version === "string" ? j : null;
  } catch { return null; }
}

export function isNewer(d: DeployedBuild | null) {
  return !!d && d.buildId !== CURRENT_BUILD_ID && d.buildId !== "dev";
}

/** Downloads the new service worker, waits for it to install, activates it and reloads. */
export async function downloadAndInstall(onStep: (s: "downloading" | "installing" | "restarting") => void) {
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (!reg) throw new Error("Updates can be installed only in the published app with an active update service.");
  onStep("downloading");
    await reg.update();
    const worker = reg.waiting ?? (await new Promise<ServiceWorker | null>((resolve) => {
      const nw = reg.installing;
      if (!nw) return resolve(reg.waiting);
      onStep("installing");
      const finish = () => {
        if (nw.state !== "installed" && nw.state !== "redundant") return;
        clearTimeout(timeout);
        nw.removeEventListener("statechange", finish);
        resolve(nw.state === "installed" ? reg.waiting : null);
      };
      const timeout = setTimeout(() => { nw.removeEventListener("statechange", finish); resolve(reg.waiting); }, 30_000);
      nw.addEventListener("statechange", finish);
      finish();
    }));
    if (!worker) throw new Error("No deployed update is ready to install. Check again after the new release is published.");
    if (worker) {
      onStep("installing");
      await new Promise<void>((resolve, reject) => {
        const changed = () => { clearTimeout(timeout); resolve(); };
        const timeout = setTimeout(() => { navigator.serviceWorker.removeEventListener("controllerchange", changed); reject(new Error("The update did not activate. Please try again.")); }, 15_000);
        navigator.serviceWorker.addEventListener("controllerchange", changed, { once: true });
        worker.postMessage({ type: "SKIP_WAITING" });
      });
    }
  onStep("restarting");
  // Hard reload so the freshly deployed files are loaded.
  window.location.reload();
}

export { APP_VERSION };
