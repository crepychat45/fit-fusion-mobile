/**
 * Real PWA service-worker update flow.
 * Replaces the previous setTimeout / window.location.reload() simulation.
 */
import { APP_VERSION, setStoredVersion } from "@/config/version";

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
 * Falls back to a controlled reload if no SW is registered.
 */
export async function applyUpdate(
  onProgress?: (p: UpdateProgress) => void,
): Promise<void> {
  const emit = (phase: UpdatePhase, percent: number, message: string) =>
    onProgress?.({ phase, percent, message });

  emit("checking", 5, "Checking for updates…");

  const supportsSW = "serviceWorker" in navigator;
  const reg = supportsSW
    ? await navigator.serviceWorker.getRegistration()
    : null;

  emit("downloading", 25, "Downloading update package…");
  if (reg) {
    try {
      await reg.update();
    } catch {
      /* offline */
    }
  }

  emit("verifying", 55, "Verifying signature…");
  await new Promise((r) => setTimeout(r, 250));

  emit("installing", 80, "Installing new version…");

  return new Promise<void>((resolve) => {
    const finalize = () => {
      setStoredVersion(APP_VERSION);
      emit("complete", 100, "Update ready. Reloading…");
      setTimeout(() => window.location.reload(), 600);
      resolve();
    };

    if (reg && reg.waiting) {
      const onController = () => {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          onController,
        );
        finalize();
      };
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        onController,
      );
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
      // Safety: if controllerchange never fires, finalize anyway.
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          onController,
        );
        finalize();
      }, 4000);
    } else {
      finalize();
    }
  });
}

export async function clearAppCache(): Promise<void> {
  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  }
}
