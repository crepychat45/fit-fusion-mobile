// Single source of truth for app version + changelog
export const APP_VERSION = "6.4.0";
export const APP_RELEASE_DATE = "2026-06-05";
export const VERSION_STORAGE_KEYS = ["fitfusion-app-version", "app-version"] as const;
// Expected SHA-256 signature of the update package (mocked for client-side demo).
// In a real deployment this is delivered by a signed manifest from the update server.
export const APP_UPDATE_SIGNATURE =
  "a1f4c9d2e6b07f3c8d5e1a9b4f2c6e8d0a7b3c5d9e1f2a4b6c8d0e2f4a6b8c0d";

export interface ReleaseSection {
  title: string;
  icon: "sparkles" | "zap" | "bug" | "shield";
  items: string[];
}

export interface ReleaseNote {
  version: string;
  date: string;
  type: "Major Release" | "Security Patch" | "Minor Update" | "Critical Security Release";
  highlight: string;
  sections: ReleaseSection[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "6.3.0",
    date: "2026-06-04",
    type: "Major Release",
    highlight:
      "Signed updates with rollback, FitX Fusion Chat rebrand, and a faster, more polished experience across every page.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Signed update packages with SHA-256 integrity verification",
          "One-click rollback to the previous version if an update fails",
          "FitX Fusion Chat — rebranded chat with cleaner header & toasts",
          "Expanded Home, Workouts, Progress & Profile widgets",
          "Refined Liquid Glass surfaces across the app",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Faster cold-start and smoother route transitions",
          "Update Manager shows clear phase-by-phase progress",
          "Better contrast and readability in dark mode",
          "More resilient auto-update with retry & rollback",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed stale version badge after install",
          "Fixed update progress getting stuck at verification",
          "Fixed chat header showing legacy product name",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "CVE-2026-0612 — Update package tampering mitigated via signature check",
          "Stricter Content-Security-Policy on update endpoints",
          "Rollback path is verified before applying any new version",
        ],
      },
    ],
  },
  {
    version: "6.2.5",
    date: "2026-05-16",
    type: "Critical Security Release",
    highlight: "Major performance overhaul, unified Update Manager, and critical security patches.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Unified App Update Manager with one-click install",
          "Liquid Glass design system across all pages",
          "Today's Goals widget on the homepage",
          "Smart background auto-update with changelog preview",
          "Enhanced AI Coach with contextual awareness",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Lazy-loaded settings panels — 60% faster Settings open time",
          "Reduced initial bundle and faster cold-start",
          "Smoother route transitions with Framer Motion",
          "Unified version source — no more mismatched version numbers",
          "Mobile/touch optimizations across all screens",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed repeated update prompts after installation",
          "Fixed version mismatch showing wrong installed version",
          "Fixed slow Settings panel load (1-2s per section)",
          "Fixed chat input hidden on mobile",
          "Fixed dark mode contrast in update screens",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "CVE-2026-0547 — Authentication bypass patch (CVSS 9.8)",
          "CVE-2026-0548 — Sensitive data exposure patched",
          "CVE-2026-0549 — Encryption protocol hardened",
          "Stricter API endpoint validation",
          "GDPR & privacy compliance updates",
        ],
      },
    ],
  },
  {
    version: "6.2.0",
    date: "2026-02-25",
    type: "Major Release",
    highlight: "Liquid Glass UI rollout, AI Coach v2, and Holographic Vault.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: ["Holographic Vault for secure documents", "AI Workout Builder", "Fitness Hub redesign"],
      },
    ],
  },
];

export function getInstalledVersion(): string {
  if (typeof window === "undefined") return APP_VERSION;
  for (const key of VERSION_STORAGE_KEYS) {
    const v = localStorage.getItem(key);
    if (v) return v;
  }
  return "6.2.0";
}

export function setInstalledVersion(version: string) {
  if (typeof window === "undefined") return;
  VERSION_STORAGE_KEYS.forEach((key) => localStorage.setItem(key, version));
  localStorage.setItem("fitfusion-last-update", new Date().toISOString());
  localStorage.setItem(`update-${version}`, "true");
  window.dispatchEvent(new CustomEvent("versionUpdated", { detail: version }));
}

export function isUpdateAvailable(): boolean {
  return getInstalledVersion() !== APP_VERSION;
}
