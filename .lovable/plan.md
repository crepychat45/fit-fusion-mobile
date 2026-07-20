
# Settings & Version Management — Full Refactor Plan

This is a large refactor touching ~15 files. Below is exactly what I'll ship. I'll implement in one pass unless you want to split it.

## Directory layout (final)

```text
src/
  config/
    version.ts                    NEW — single source of truth (re-exports app-version)
  components/
    settings/
      version-control-panel.tsx   NEW — merges version-manager + enhanced-version-manager
      account-security-panel.tsx  NEW — profile + password + 2FA + sessions
      appearance-panel.tsx        NEW — theme + accent + font scale + reduce motion
      notification-preferences.tsx NEW — push/email/haptic granular toggles
      data-backup-panel.tsx       NEW — cloud backup + clear cache + storage bar
      settings-copilot.tsx        NEW — AI natural-language settings bar
      system-health-panel.tsx     NEW — latency + storage quota + 1-click fix
      pwa-vault-panel.tsx         NEW — offline + SW update + install prompt
      network-adaptive-banner.tsx NEW — data-saver via navigator.connection
      settings-container.tsx      EDIT — wire new panels, replace window.confirm with AlertDialog
      privacy-settings.tsx        EDIT — AlertDialog for destructive actions
      update-scheduler.tsx        EDIT — fix corrupted UTF-8 glyphs, use Lucide icons
      unified-update-manager.tsx  EDIT — use versionApi, real SW update path
    version-manager.tsx           DELETE
    enhanced-version-manager.tsx  DELETE
  utils/
    version-api.ts                NEW — SW update, applyUpdate, localStorage helpers
    network-adaptive.ts           NEW — connection detection + data-saver toggle
```

## Step 1 — Bug fixes

- **Centralized version state**: `src/config/version.ts` re-exports `APP_VERSION` from `src/lib/app-version.ts`. New helper `useAppVersion()` returns `{ current, latest, storedKey: "fitfusion_app_version" }`. Every read/write goes through this hook — no more three overlapping keys.
- **Real SW update**: `applyUpdate()` calls `navigator.serviceWorker.getRegistration()`, invokes `reg.update()`, posts `SKIP_WAITING` to the waiting worker, then reloads once `controllerchange` fires. Fallback to a controlled `window.location.reload()` only if no SW is registered.
- **UTF-8 fixes**: Replace corrupted glyphs in `update-scheduler.tsx` with `<Clock />`, `<Calendar />`, `<Sliders />` Lucide icons.
- **Merge duplicates**: `VersionControlPanel.tsx` combines the two managers into one responsive card (current version, changelog viewer, check-for-updates, install, rollback).
- **Secure deletes**: Introduce reusable `ConfirmDialog` (Shadcn `AlertDialog`) and swap every `window.confirm(...)` in `settings-container.tsx` and `privacy-settings.tsx` for it (typed "DELETE" for destructive irreversible actions).

## Step 2 — Standard settings features

- **Account & Security panel**: Avatar upload (existing hook), display name, phone; password change via `supabase.auth.updateUser`; 2FA placeholder toggle; active sessions listed via `supabase.auth.getUser()` metadata + local device fingerprints; "Sign out of all devices" using `{ scope: "global" }`.
- **Appearance panel**: Theme radio (Light / Dark / System / High Contrast — HC adds a `.hc` class with boosted contrast tokens), accent picker (Blue/Emerald/Purple/Amber via `applyAccent`), font scale slider (14–20px via `applyFontSize`), Reduce Motion toggle (writes `data-reduce-motion="true"` on `<html>` and gates Framer Motion via a global `MotionConfig`).
- **Notification preferences**: Granular switches persisted per-user in `localStorage` (namespaced `fitfusion:notif:${uid}`): push, email digest weekly/monthly, in-app sound, haptic (vibration API test).
- **Data & Backup**: Storage usage bar via `navigator.storage.estimate()`, "Clear Cache" (unregisters SW caches only, preserves auth), cloud-backup status stub with schedule dropdown (Daily/Weekly persisted).

## Step 3 — Advanced AI + platform features

- **Settings Copilot**: Sticky bottom bar with input + mic (Web Speech API). Parses commands with a small local intent map first (fast, offline), then falls back to Lovable AI (`google/gemini-2.5-flash`) via a new `settings-copilot` edge function only if the local matcher returns null. Supports commands: enable/disable dark mode, set accent, schedule updates at HH:MM, toggle data saver, clear cache.
- **Network-Adaptive engine**: `network-adaptive.ts` reads `navigator.connection.effectiveType/saveData`. On `2g`/`3g`/`saveData` it sets a global `data-saver` flag; heavy widgets read the flag and skip HD assets. `<NetworkAdaptiveBanner />` surfaces the mode in Settings.
- **System Health panel**: Runs `runStartupDiagnostics()` + measures Supabase round-trip latency + shows `navigator.storage.estimate()` quota bar + sync queue length from React Query cache. "Fix App Errors" button clears caches, unregisters app SW, and reloads — session preserved.
- **PWA Vault**: Live offline status, "Update ready" chip driven by SW `waiting` state, custom Install button using stashed `beforeinstallprompt` event.

## Notes for you

- No schema changes, no migrations, no new secrets required.
- Existing `use-enhanced-auth`, `use-profile`, `applyAccent`, `applyFontSize` are reused — no behavior regressions expected on those flows.
- I'll delete the two duplicate version-manager files after wiring the panel.
- All new panels use `liquid-glass` classes for consistency.

Approve and I'll implement in one pass.
