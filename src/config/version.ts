/**
 * Single source of truth for version state.
 * Every settings/version component MUST read/write through this module.
 */
import { APP_VERSION, APP_RELEASE_DATE, RELEASE_NOTES } from "@/lib/app-version";

export const VERSION_STORAGE_KEY = "fitfusion_app_version";
export const UPDATE_SCHEDULE_KEY = "fitfusion_update_schedule";
export const AUTO_UPDATE_KEY = "fitfusion_auto_update";

export interface VersionInfo {
  current: string;
  latest: string;
  releaseDate: string;
  hasUpdate: boolean;
}

export function getStoredVersion(): string {
  try {
    return (
      localStorage.getItem(VERSION_STORAGE_KEY) ||
      // Legacy fallback keys — read only, migration happens on next write.
      localStorage.getItem("fitfusion-app-version") ||
      localStorage.getItem("app-version") ||
      APP_VERSION
    );
  } catch {
    return APP_VERSION;
  }
}

export function setStoredVersion(v: string) {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, v);
    // Clean up legacy duplicates.
    localStorage.removeItem("fitfusion-app-version");
    localStorage.removeItem("app-version");
    localStorage.setItem("fitfusion-last-update", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("versionUpdated", { detail: v }));
  } catch {
    /* storage unavailable */
  }
}

export function getVersionInfo(): VersionInfo {
  const current = getStoredVersion();
  return {
    current,
    latest: APP_VERSION,
    releaseDate: APP_RELEASE_DATE,
    hasUpdate: current !== APP_VERSION,
  };
}

export { APP_VERSION, APP_RELEASE_DATE, RELEASE_NOTES };
