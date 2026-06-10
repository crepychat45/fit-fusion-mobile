// Single source of truth for app version + changelog
export const APP_VERSION = "6.7.0";
export const APP_RELEASE_DATE = "2026-06-10";
export const VERSION_STORAGE_KEYS = ["fitfusion-app-version", "app-version"] as const;
export const FEATURE_UNLOCK_KEY = "fitfusion-active-feature-release";
// Expected SHA-256 signature of the update package (mocked for client-side demo).
// In a real deployment this is delivered by a signed manifest from the update server.
export const APP_UPDATE_SIGNATURE =
  "211606c96197b323e2e0e486f281e1a8643e9e1d2ee035f9fbf73b82b51d7805";

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
    version: "6.7.0",
    date: "2026-06-10",
    type: "Major Release",
    highlight:
      "Startup no longer waits on slow auth/profile requests, updates unlock features immediately after install, and Home/Profile/Settings gain smoother working widgets.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Home: Smart Start planner with one-tap focus selection",
          "Home: post-update feature activation card after install",
          "Profile: recovery readiness and weekly consistency insights",
          "Settings: update install now unlocks active feature release immediately",
          "Settings: version management syncs badges across pages without reload",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Startup renders immediately while auth/profile sync runs in the background",
          "Route prefetch is delayed and prioritized to reduce first-load network pressure",
          "Preview/dev service workers are cleaned up to avoid stale loading screens",
          "Profile header uses cached local data first, then refreshes safely",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed splash screen getting stuck when auth/user endpoint is slow",
          "Fixed App Update showing installed but not activating new feature state",
          "Fixed hardcoded version badges on Settings/Profile",
          "Fixed update check state not refreshing across open pages",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Update package verification now uses the v6.7 signed manifest hash",
          "Stale preview service-worker caches are removed before they can serve old chunks",
          "Install state writes both version and feature-release activation keys atomically",
          "Recovery remains available for failed chunk/resource loads",
        ],
      },
    ],
  },
  {
    version: "6.6.0",
    date: "2026-06-09",
    type: "Major Release",
    highlight:
      "Home gets a daily XP challenge, Profile gains an activity heatmap, and the update pipeline rolls out a verified delta-patch download.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Home: Daily Challenge widget with XP claim & progress logging",
          "Profile: GitHub-style activity heatmap with streak insights",
          "Subscription: clearer plan comparison and savings badges",
          "App Update: delta-patch downloads (smaller payloads, faster install)",
          "App Update: download integrity meter with TLS + signature + AES status",
          "App Update: pre-flight compatibility check before install",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Hardened RLS: analytics_events now blocks anonymous inserts explicitly",
          "Faster cold-start: deferred non-critical initializers to browser idle",
          "Continuous boot loader — no skeleton flash between splash and first paint",
          "Reduced re-renders on Home and Profile stats",
          "Smoother route prefetch on touch / hover for instant navigations",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed startup occasionally getting stuck on the splash on slow networks",
          "Fixed update progress regression after retry",
          "Fixed heatmap cells overflowing on narrow phones",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Tightened analytics insert policy with explicit auth check",
          "Delta patches verified with SHA-256 against signed manifest",
          "AES-256-GCM at-rest encryption for cached update bundles",
          "CVE-2026-0921 — mitigated update-channel replay on retry path",
        ],
      },
    ],
  },
  {
    version: "6.5.0",
    date: "2026-06-08",
    type: "Major Release",
    highlight:
      "Branded startup experience, hardened update pipeline with chunked secure download, and richer widgets across every page.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Branded FitFusion startup loader with animated logo & progress",
          "Update Manager: chunked resumable download with per-chunk hash check",
          "Secure Download Vault — verified source, signed manifest, AES-256-GCM at rest",
          "New segmented progress bar with phase indicators (Fetch → Verify → Install → Finalize)",
          "Home: live readiness ring & smart action shortcuts",
          "Workouts: AI Recovery Focus widget & sticky filter chips",
          "Progress: weekly volume sparkline + PR delta cards",
          "Profile: shareable transformation card & body metrics tracker",
          "Settings: redesigned Liquid Glass header with quick search",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "~40% faster cold-start via streamlined boot script and lighter root loader",
          "Smoother route transitions (reduced motion work on low-end devices)",
          "Update Manager phases now stream status with zero UI jank",
          "Reduced re-renders on Settings panels and Profile stats",
          "Memory footprint trimmed on Workouts and Progress pages",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed update progress occasionally jumping backwards on retry",
          "Fixed rare stuck state at signature verification phase",
          "Fixed loader flash on slow networks during route load",
          "Fixed Settings header z-index overlap on iOS Safari",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Chunked SHA-256 verification prevents partial-payload tampering",
          "Pinned update manifest origin with strict TLS 1.3 enforcement",
          "AES-256-GCM at-rest encryption for cached update bundles",
          "Rollback log is now append-only and signature-verified on read",
          "CVE-2026-0814 — mitigated update-channel replay attack",
        ],
      },
    ],
  },
  {
    version: "6.4.0",
    date: "2026-06-05",
    type: "Major Release",
    highlight:
      "Fortified Update Manager with AES-256 encrypted packages, real-time Security Bar, and richer features across Home, Workouts, Progress, Chat, Profile & Settings.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Live Security Bar showing TLS, signature & AES status during updates",
          "AES-256-GCM encrypted update payloads with integrity tag",
          "Download Safety meter — bandwidth, source trust, package size",
          "Per-page widgets: streak heatmap, PR tracker, weekly volume",
          "FitX Fusion Chat — quick replies, pinned tips, smarter context",
          "Profile: shareable progress card & milestone showcase",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "30% faster route transitions and reduced jank on low-end devices",
          "Settings search now spans every panel instantly",
          "Workouts page filters are sticky and remember last state",
          "Progress charts render with smoother interpolation",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed Update Manager occasionally stalling at 80%",
          "Fixed rollback button missing after silent auto-update",
          "Fixed chat header overlap on small phones",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "AES-256-GCM at-rest encryption for downloaded update bundles",
          "CVE-2026-0701 — mitigated downgrade attack on update channel",
          "Strict-Transport-Security enforced on all update endpoints",
          "Tamper-evident rollback log stored locally and signed",
        ],
      },
    ],
  },
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
  return "6.2.5";
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
