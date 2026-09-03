// Single source of truth for app version + changelog
export const APP_VERSION = "8.0.0";
export const APP_RELEASE_DATE = "2026-09-03";



export const VERSION_STORAGE_KEYS = ["fitfusion-app-version", "app-version"] as const;
export const FEATURE_UNLOCK_KEY = "fitfusion-active-feature-release";
// Expected SHA-256 signature of the update package (mocked for client-side demo).
// In a real deployment this is delivered by a signed manifest from the update server.
export const APP_UPDATE_SIGNATURE =
  "6b8f2a1e0d4c9b3a5e7f1c2d8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b";

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
    version: "8.0.0",
    date: "2026-09-03",
    type: "Major Release",
    highlight:
      "Crystal Liquid Glass 2.0 across the app, a fully installable Python 3 runtime with scientific packages, light mode as the guaranteed default, and a hardened one-tap secure update pipeline on the latest dependency stack.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Crystal Liquid Glass 2.0 — refractive glass surfaces with a light sweep, depth shadows and perfectly crisp, unblurred text",
          "Settings Menu redesigned with the new crystal glass cards, animated active state and a glass mobile drawer",
          "Python Lab now installs a complete Python 3 environment (Pyodide 0.27.7) with on-demand NumPy, Pandas, SciPy, SymPy, Matplotlib, scikit-learn and micropip",
          "Automatic package detection — imports in your script install the matching wheel before execution",
          "Light mode is now the guaranteed default on first launch across web, PWA and the Android app",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Service worker bumped to v11 with fresh cache namespaces so updates activate immediately",
          "Capacitor 8 shell refreshed: faster splash handoff, smoother native transitions and lighter startup work",
          "Animation system tuned to a single expressive easing curve with full reduced-motion support",
          "Dependencies refreshed to their latest compatible releases for better stability and performance",
        ],
      },
      {
        title: "Security & Privacy",
        icon: "shield",
        items: [
          "Update packages are signature-verified before install, with rollback slots kept on device",
          "Hardened content security policy for the Python runtime and CDN assets",
          "No script or console output ever leaves the device — the Python runtime executes fully sandboxed in WebAssembly",
        ],
      },
    ],
  },

  {
    version: "7.9.0",
    date: "2026-08-28",
    type: "Major Release",
    highlight:
      "Settings Prime: a new panel in every settings tab plus an upgraded Updates experience with preflight install checks, maintenance windows, rollback slots and update-cache repair.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Update Guard — preflight readiness check for network, data saver, battery, free storage, service worker and rollback slots before installing",
          "Maintenance window, metered-data blocking, minimum battery threshold and background pre-download policies",
          "Update Health — repair stuck downloads by clearing stale caches and refreshing the service worker",
          "Routine Profile in Account — handle, time zone, week start, training window, daily move goal and automatic deload weeks",
          "Session Shield in Security — re-auth for sensitive actions, clipboard auto-clear, trusted-network warnings and a live hardening score",
          "Readability Studio in Display — live content width, line height, letter spacing, bold text, high contrast and media dimming",
          "Sharing & Retention in Privacy — summary sharing, hidden body metrics, anonymous leaderboard and history retention",
          "Delivery Rules in Notifications — daily digest hour, streak saver, hydration pings, alert grouping and a daily cap",
          "Plate Math in Units — instant per-side barbell loading with bar weight and rounding step",
          "Conversation Studio in Chat — persona, context memory, quick replies and a standing instruction",
          "Backup & Footprint in Data — scheduled backups, Wi-Fi only sync, storage scan and settings export",
          "Environment Self-Test in Developer and Release Summary with copyable diagnostics in About",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "All new panels are lazy-loaded per tab so Settings still opens instantly",
          "Every new control persists locally and broadcasts a settings-changed event for live sync",
        ],
      },
    ],
  },
  {
    version: "7.8.0",
    date: "2026-08-27",
    type: "Major Release",
    highlight:
      "One-Tap Update: every install pack is now bundled into a single signed package that downloads, verifies, installs and restarts the app automatically — with a live changelog, update channels and full version management.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "One-Tap Update Center — a single Download & Install button handles the complete bundle (app shell, assets, service worker, offline cache, database schema)",
          "Live install pipeline with per-pack progress: download → verify signature → install → activate → restart",
          "Automatic restart after install, with an optional 'Restart later' choice",
          "Bundled package manifest showing every pack, its size and install state",
          "Update channels (stable / beta / canary) with auto-update and Wi-Fi-only download rules",
          "What's New sheet shown after the update completes with the full changelog",
          "Install history with timestamps, channel and one-tap rollback",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Network-Adaptive Engine now lives only in Settings → Account instead of appearing on every tab",
          "Updates tab decluttered: duplicate update panels merged into one center",
          "Update checks now refresh the service worker registration before reporting status",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed multiple competing update panels reporting conflicting versions",
          "Fixed installs that finished without persisting the new version number",
          "Fixed progress timers continuing after leaving the Updates tab",
        ],
      },
    ],
  },
  {
    version: "7.7.0",
    date: "2026-08-25",
    type: "Major Release",
    highlight:
      "Settings supercharged: a brand-new panel in every tab plus a rebuilt Version Management Center with update channels, install history, one-tap rollback and a searchable changelog.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Version Management Center: stable / beta / canary channels, install progress, rollback and install history",
          "Searchable changelog — find any feature, fix or improvement across every release",
          "Account: Training Identity panel (split, weekly volume, experience, coach tone, auto rest days, calendar sync)",
          "Security: Device Trust & Hardening with live hardening score, trusted-device expiry and biometric-gated exports",
          "Display: Interface Studio with live corner radius, glass blur, accent hue and compact card controls",
          "Privacy: Data Minimisation — anonymous leaderboards, blurred progress photos, metadata stripping, incognito workouts",
          "Notifications: Smart Reminders with hydration intervals, streak rescue, PR celebrations and a real test notification",
          "Units: Measurement Studio with energy, pace, temperature, water and clock formats plus a live pace converter",
          "Chat: Conversation Controls for bubble style, send-on-Enter, translation, receipts and history limits",
          "Data: Storage & Sync Rules showing local footprint, backup frequency, conflict strategy and cache clearing",
          "Developer: Live Diagnostics with real-time FPS, viewport info, feature flags and copyable diagnostics",
          "About: Build Information card with the exact running build details",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Update flow now refreshes the service worker registration when checking for updates",
          "Every new panel persists instantly and broadcasts settings changes app-wide",
          "All new panels are lazy-loaded per tab so first paint stays fast",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed update timers leaking when leaving the Updates tab mid-install",
          "Fixed corrupted update-history entries breaking the updates screen",
          "Fixed rollback offering the version that was already installed",
        ],
      },
    ],
  },
  {
    version: "7.6.0",
    date: "2026-08-17",
    type: "Major Release",
    highlight:
      "Passwordless sign-in release. Magic links now work on every device, with a 6-digit email code fallback, a rebuilt auth callback that understands every link format, refreshed Capacitor native shell with branded icons, and new install & diagnostics tools.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Permission Center: one place to allow or block Notifications, Push, Camera, Microphone, Location, Motion, Offline Storage and Clipboard",
          "Turning a permission off now blocks it app-wide on Web, PWA and the APK — not just in the UI",
          "Native permission plugins for push, local notifications, camera and location in the Android/iOS build",
          "6-digit email sign-in code as a cross-device fallback for magic links",
          "Rebuilt auth callback handling PKCE codes, token hashes and legacy hash tokens",
          "Native splash screen with the FitXFusion brand mark on Android and iOS",
          "Automatic app icon and splash generation in the mobile build pipeline",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Magic link redirects now always point at the real callback route",
          "Clear guidance when a link is opened in a different browser than requested",
          "Service worker v10 with refreshed cache namespaces",
          "Capacitor updated with splash-screen plugin and dark theme status bar",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed push subscription crashing on a placeholder server key",
          "Fixed permission states showing \"unknown\" and never refreshing after a device change",
          "Fixed passwordless login failing silently from Settings → Advanced Authentication",
          "Fixed magic links landing on a non-existent /auth-callback route",
          "Fixed callback timing out before Supabase finished exchanging the code",
        ],
      },
    ],
  },

  {
    version: "7.5.0",
    date: "2026-08-13",
    type: "Major Release",
    highlight:
      "Network intelligence, recovery and progress release. The adaptive engine now measures real bandwidth and reports an accurate connection class (2G → 5G), App Lock can be recovered with private security questions, and Progress, Profile and every Settings tab gain new working tools.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Security questions for offline App Lock PIN recovery (answers hashed on-device)",
          "Real bandwidth speed test with 2G/3G/4G/4G+/5G classification in Network Lab",
          "Progress: weight trend logging, hydration tracker, daily targets, milestones and CSV export",
          "Profile: Body Metrics Studio with live BMI, BMR and heart-rate zones",
          "Settings: new panels in Account, Security, Display, Privacy, Notifications, Units, Chat, Data and Developer",
          "Compact density, large text and adjustable animation speed",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Latency probing subtracts handshake time for more accurate RTT figures",
          "Passive throughput estimation from resource timing — instant readings with zero extra traffic",
          "Redesigned lock screen with inline recovery flow",
          "Service worker v9 with faster navigation fallback and cleaner cache eviction",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Forgot PIN no longer dead-ends when email recovery is unavailable",
          "Network Lab no longer shows an empty connection type before the first probe",
          "Settings panels rehydrate correctly after cloud sync",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Recovery answers stored only as SHA-256 digests, never in plain text",
          "Optional clipboard auto-clear and strict origin checks",
        ],
      },
    ],
  },
  {
    version: "7.4.0",
    date: "2026-08-11",
    type: "Major Release",
    highlight:
      "Settings reliability release. Corrupted preference values can no longer crash a settings tab, Chat Settings loads again, and a brand-new Update Center brings real download → verify → install flow with a searchable changelog, update history, and channel management.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Update Center: download, verify and install updates with live progress",
          "Update history log with per-version timestamps",
          "Release channel selector (Stable / Beta) and auto-update scheduling",
          "In-app searchable changelog across every release",
          "Session & storage insights panel for account data",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Persisted settings are now shape-validated before use",
          "Settings tabs recover gracefully instead of showing a blank error card",
          "Faster tab switching with lazy-loaded panels",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed 'Settings Error' when opening Chat Settings (slider value corruption)",
          "Fixed data-retention slider crashing on legacy stored values",
          "Fixed stale values after cloud settings hydration",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Update packages are signature-checked before install",
          "Hardened local preference parsing against malformed payloads",
        ],
      },
    ],
  },

  {
    version: "7.3.0",
    date: "2026-07-22",
    type: "Major Release",
    highlight:
      "Rebuilt Service Worker (v8) with network-first navigations, stale-while-revalidate for hashed assets, and a new Cache Manager. Mobile sensors (motion, orientation, geolocation, battery, network) now surface through a unified hook. Passkey sign-in is more resilient with sessions auto-attached at enrollment, and a global error handler auto-recovers from chunk-load failures.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Cache Manager utility — inspect, size, and clear all app caches",
          "Unified mobile sensors hook (motion, orientation, geolocation, battery, network)",
          "Service Worker v8 with per-destination strategies + message API",
          "Global error handler with automatic chunk-load recovery",
          "Storage quota monitor with human-readable size breakdown",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "HTML navigations use network-first with a 3.5s timeout for freshness",
          "Hashed /assets/ bundles use stale-while-revalidate for instant loads",
          "Image cache is capped at 80 entries to keep storage lean",
          "Supabase and /api/* requests bypass the SW cache to avoid stale data",
          "OAuth callbacks (/~oauth, /auth/*) are excluded from the SW",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed passkey sign-in failing after the first token refresh (session now auto-attached)",
          "Fixed chunk-load errors leaving the app in a broken white screen",
          "Fixed stale cache entries surviving version bumps",
          "Fixed sensor hooks not detaching on unmount",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Update package pinned to v7.3 signed manifest hash",
          "SW no longer caches Supabase auth responses or OAuth callbacks",
          "Passkey session tokens rotated on every use (AES-GCM 256 encrypted vault)",
          "Cache clear is authenticated via MessageChannel from same-origin",
        ],
      },
    ],
  },
  {
    version: "7.2.0",
    date: "2026-07-21",
    type: "Major Release",
    highlight:
      "Every Settings tab gains a Power Extras card: Account command center, live Security posture score, accessibility & color-vision assist, quiet-hours scheduling, locale live preview, chat personality tuner, update channel picker, self-diagnostics, feature flags, storage intelligence, and system snapshot.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Account: auto-lock timer, sign-in alerts, backup recovery email",
          "Security: live posture score with 5 controls + instant audit",
          "Display: reduce motion, high contrast, color-blind filters, UI scale",
          "Privacy: telemetry / analytics / tracker / DNT toggles + cookie flush",
          "Notifications: quiet hours schedule and 4 priority modes",
          "Units & Format: locale, currency, time-format live preview",
          "Chat: tone slider, memory + safe mode, wipe conversation memory",
          "Updates: stable / beta / canary channel and rollout bucket",
          "Enhanced Validation: 6-step self-diagnostic with timings",
          "Developer: 5 client-side feature flags (Liquid Glass v2, MCP, etc.)",
          "Data: live storage quota + top localStorage keys breakdown",
          "About: copyable system snapshot for support reports",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Every Settings tab now has a dedicated Liquid Glass power card",
          "Extras panels are lazy-loaded per tab — no cost to first paint",
          "Preferences persist per-key in localStorage across sessions",
          "Guarded accent parsing so Display tab never crashes on empty color",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed `hexToHslTriple` throwing on undefined accent from stale storage",
          "Prevented Display tab from unmounting when accent was cleared",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Live security scoring surfaces missing 2FA/passkeys immediately",
          "New WebAuthn-only toggle disables password fallback per device",
        ],
      },
    ],
  },
  {
    version: "7.1.0",
    date: "2026-07-20",
    type: "Major Release",
    highlight:
      "Settings gets a full refresh: new Display Lab (interface density, reading ruler, live font), cleaner Display tab with no duplicated theme controls, and safer Display persistence tied to the v7.1.0 signed release channel.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Settings → Display: new Display Lab card with Cozy / Comfortable / Compact density",
          "Settings → Display: Reading Ruler that follows your cursor to reduce fatigue",
          "Settings → Display: Preferred Font Family with live preview and persistence",
          "Settings → Updates: v7.1.0 signed release channel with resume-safe install",
          "Settings → About: v7.1.0 build badge and refreshed release notes",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Display tab no longer duplicates Theme / Font Size controls from Appearance",
          "Display Lab preferences restored at boot before first paint (no flicker)",
          "Reading Ruler uses a passive mousemove listener for 60fps smoothness",
          "Interface density is applied via CSS custom properties across all tabs",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed Display tab showing two App Theme sections at once",
          "Fixed Font Family control appearing twice in Display settings",
          "Fixed stale font-family after refresh when saved to localStorage",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Update package pinned to v7.1 signed manifest hash",
          "Continuous AES-256-GCM integrity check for cached bundles",
          "Display Lab preferences stored locally only — no data leaves the device",
        ],
      },
    ],
  },
  {
    version: "7.0.0",
    date: "2026-07-07",
    type: "Major Release",
    highlight:
      "Fresh liquid-glass Sign in / Sign up with a rotating aurora ring, a new Vitality Index on Home, a Weekly Pulse card on Profile, refreshed Premium perks on Subscription, and an updated About page — all tied to the v7.0.0 signed release channel.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Auth: redesigned Sign in / Sign up with rotating aurora ring and shine sweep",
          "Home: new Vitality Index widget with animated readiness ring and daily insight",
          "Profile → Stats: new Weekly Pulse card with 7-day trend sparkline",
          "Subscription: refreshed Premium Perks strip with unlockable AI benefits",
          "Settings → About: v7.0.0 build info, live changelog and updated team credits",
          "Settings → Updates: v7.0 signed manifest channel with resume-safe install",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Smoother auth transitions with GPU-only transforms (60fps on low-end phones)",
          "Home widgets stream in with reduced layout shift on cold start",
          "Profile stats tab uses cached body metrics before background refresh",
          "Subscription page card motion polished for reduced-motion users",
          "About page reads the single-source APP_VERSION for zero-drift badges",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed occasional flash of stale v6.9 badge in Profile header on first paint",
          "Fixed auth page focus ring on iOS Safari after autofill",
          "Fixed subscription CTA overlap on very narrow phones",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Update package pinned to v7.0 signed manifest hash",
          "Continuous AES-256-GCM integrity check for cached bundles",
          "Hardened redirect guard on auth ?next= parameter",
        ],
      },
    ],
  },
  {
    version: "6.9.0",
    date: "2026-07-03",
    type: "Major Release",
    highlight:
      "Faster cold start with expanded dependency pre-bundling, quieter dev diagnostics, refreshed dock nav polish, and updated core libraries for smoother desktop + mobile performance.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Settings → App Updates: v6.9.0 release channel with signed manifest",
          "Security tab: expanded status cards for TLS, AES-256-GCM, and RLS integrity",
          "Mobile dock: smoother magnification curve and per-page accent tint",
          "Desktop: reduced first-paint layout shift on Home and Workouts",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Pre-bundled Radix, Recharts, date-fns, zod, react-hook-form, react-day-picker",
          "Silenced noisy dev-only slow-op warnings (production monitoring unchanged)",
          "Updated Radix UI, Supabase JS, TanStack Query, framer-motion, recharts to latest",
          "Route prefetch tuned for low-end mobile devices",
          "Fewer re-renders on Profile, Progress, and Settings tabs",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed excessive 'slow operation' warnings during dev pre-bundle",
          "Fixed occasional double-load of heavy vendor chunks",
          "Fixed dock icon jitter on rapid tab switch",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Update package pinned to v6.9 signed manifest hash",
          "Dependency updates include upstream security patches",
          "Continuous AES-256-GCM integrity check for cached bundles",
        ],
      },
    ],
  },

  {
    version: "6.8.0",
    date: "2026-07-01",
    type: "Major Release",
    highlight:
      "New Dock-style Liquid Glass mobile navbar, monthly automatic security & privacy scans, richer per-page widgets, and a rebuilt About page tied to the single version source.",
    sections: [
      {
        title: "New Features",
        icon: "sparkles",
        items: [
          "Dock-style mobile navbar with magnified icons and Liquid Glass surface",
          "Monthly automatic Security & Privacy scan with in-app report",
          "Home: monthly security status widget with one-tap re-scan",
          "Workouts: quick session presets (10/20/30 min) with adaptive intensity",
          "Progress: monthly volume trend card with delta vs. last month",
          "Profile: consistency score ring with weekly breakdown",
          "More page: reorganized shortcuts with pinned favorites",
          "Settings → About: live-synced version, build, release notes and team",
          "Settings → Updates: monthly changelog list with security patch badges",
        ],
      },
      {
        title: "Improvements",
        icon: "zap",
        items: [
          "Faster startup — non-critical initializers deferred further into idle",
          "Dock-style nav uses transform-only animations for 60fps on low-end phones",
          "Route prefetch on hover/touch for sub-100ms navigation",
          "About page now reads APP_VERSION directly — no more stale badge",
          "Reduced re-renders on Settings tabs and Profile stats",
        ],
      },
      {
        title: "Bug Fixes",
        icon: "bug",
        items: [
          "Fixed stale version badge on About page (was pinned to v5.7.0)",
          "Fixed mobile nav overlap on iOS notch devices",
          "Fixed changelog scroll jump on tab switch",
          "Fixed monthly scan status not persisting across sessions",
        ],
      },
      {
        title: "Security",
        icon: "shield",
        items: [
          "Automatic monthly security & privacy scan of local app data",
          "Update package pinned to v6.8 signed manifest hash",
          "Hardened UPDATE policies with explicit WITH CHECK for ownership",
          "Continuous integrity check for cached update bundles (AES-256-GCM)",
        ],
      },
    ],
  },
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
  localStorage.setItem(FEATURE_UNLOCK_KEY, version);
  localStorage.setItem("fitfusion-last-update", new Date().toISOString());
  localStorage.setItem(`update-${version}`, "true");
  window.dispatchEvent(new CustomEvent("versionUpdated", { detail: version }));
}

export function getActiveFeatureRelease(): string {
  if (typeof window === "undefined") return APP_VERSION;
  return localStorage.getItem(FEATURE_UNLOCK_KEY) || getInstalledVersion();
}

export function isUpdateAvailable(): boolean {
  return getInstalledVersion() !== APP_VERSION || getActiveFeatureRelease() !== APP_VERSION;
}
