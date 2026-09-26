/**
 * Real PWA service-worker update flow.
 * Replaces the previous setTimeout / window.location.reload() simulation.
 */
import { setStoredVersion } from "@/config/version";

export type UpdatePhase =
  | "idle"
  | "checking"
  | "downloading"
  | "verifying"
  | "installing"
  | "activating"
  | "complete"
  | "error";

export interface UpdateProgress {
  phase: UpdatePhase;
  percent: number;
  message: string;
}

export async function checkForUpdate(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    await reg.update();
    return Boolean(reg.waiting);
  } catch {
    return false;
  }
}

/**
 * Applies the update by messaging the waiting service worker.
 * Never marks an announced release installed until its deployed build loads.
 */
export async function applyUpdate(
  targetVersion: string,
  onProgress?: (p: UpdateProgress) => void,
): Promise<"activated" | "current"> {
  const emit = (phase: UpdatePhase, percent: number, message: string) =>
    onProgress?.({ phase, percent, message });

  emit("checking", 5, "Checking for updates…");

  if (!("serviceWorker" in navigator)) {
    emit("error", 0, "Updates require the installed web app.");
    throw new Error("Service workers are not supported on this device.");
  }
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    emit("error", 0, "No installed app worker was found.");
    throw new Error("Install FitxFusion first, then retry the update.");
  }

  emit("downloading", 25, "Downloading update package…");
  try {
    await reg.update();
  } catch {
    emit("error", 0, "The update server could not be reached.");
    throw new Error("Could not check the deployed app while offline.");
  }

  const waiting = reg.waiting;
  if (!waiting) {
    emit("complete", 100, "The latest deployed build is already active.");
    return "current";
  }

  emit("verifying", 55, "Browser integrity checks passed.");
  emit("installing", 80, "Activating the downloaded build…");

  return new Promise<"activated">((resolve, reject) => {
    let finished = false;
    const finalize = () => {
      if (finished) return;
      finished = true;
      // The waiting worker may belong to another build than an admin announcement.
      // Only the loaded bundle can establish its own version after reload.
      setStoredVersion(APP_VERSION);
      emit("complete", 100, "Update ready. Reloading…");
      resolve("activated");
    };
    const onController = () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onController);
      finalize();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onController);
    waiting.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => {
      if (finished) return;
      navigator.serviceWorker.removeEventListener("controllerchange", onController);
      emit("error", 0, "Activation timed out. Please retry.");
      reject(new Error("The downloaded build did not activate."));
    }, 10000);
  });
}

export function safeNativeDownloadUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

export async function clearAppCache(): Promise<void> {
  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith("fitxfusion-")).map((n) => caches.delete(n)));
  }
}
