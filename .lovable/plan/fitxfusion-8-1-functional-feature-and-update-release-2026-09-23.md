# FitxFusion 8.1 — Functional Feature and Update Release

## Goal
Ship a focused major improvement across the core app instead of adding placeholder controls. Each addition will use existing workout, profile, settings, notification, and cloud data, persist changes, and remain usable on mobile.

## Core page improvements
- **Home:** Add a compact “Today” command strip showing the next workout, current weekly goal, recovery state, and one-tap actions. Values will come from existing workout/progress storage and update immediately after activity changes.
- **Workouts:** Add recent filters and a functional workout queue. Users can add, reorder, remove, and start queued workouts; the queue persists per device and keeps favorite/completed state intact.
- **Progress:** Replace fixed summary values where possible with recorded session data. Add selectable 7/30/90-day ranges and export/share the currently selected range.
- **Chat:** Add conversation search, local draft recovery, connection/retry status, and safe retry for failed messages without duplicating sends.
- **Profile:** Add a privacy-aware activity summary and a portable profile/settings export with clear success and failure feedback.
- **Settings:** Add a searchable setting index that opens the correct section, plus a release status panel showing the running build, available build, update channel, last check, and install state.

## Mobile navigation redesign
- Rework the bottom dock into a clear Crystal Liquid Glass surface with crisp text, semantic theme colors, safe-area spacing, stable touch targets, reduced-motion support, and no decorative blur over labels/icons.
- Keep the admin entry role-gated and preserve notifications, dynamic links, quick actions, long-press menus, and the update badge.

## Admin improvements
- Strengthen release publishing with validated semantic versions, duplicate-version checks, stable/beta channel targeting, required-update controls, release notes, optional signed APK/download URL, scheduled publishing, and activation/deactivation.
- Add delivery status summaries for releases, announcements, and broadcasts using existing cloud records.
- Keep Dynamic Links live, validate internal/external destinations, and prevent unsafe URL schemes.
- Record release and link changes in the existing admin audit trail.

## Real update and version management
- Release as **v8.1.0** and add a categorized changelog to the centralized version history.
- Remove the simulated timer-based “installation” that only changes local storage.
- For web/PWA, check the registered service worker, detect a waiting worker, activate it with `SKIP_WAITING`, wait for `controllerchange`, then reload into the deployed build. Display truthful states when no newer deployed assets are available.
- For Android packages, validate and open the admin-provided HTTPS download URL; the operating system performs the actual APK install.
- Treat admin release records as availability/notes metadata, not as executable code. A published deployment must exist before the web app can install that version.
- Keep install history based on successfully activated builds, not button clicks, and reconcile the displayed installed version with the bundled version on startup.
- Update the service-worker cache version and ensure stale caches are removed without clearing authentication or user data.

## Performance, security, and accessibility
- Remove the remote CSS font import that blocks startup and use the existing system font stack.
- Lazy-load newly added secondary panels, memoize derived lists, cap persisted histories, and avoid new polling loops.
- Validate dynamic links and release download URLs; reject `javascript:`, `data:`, and non-HTTPS external links.
- Add accessible labels to icon controls touched in this release, keyboard/focus support, readable contrast, and minimum mobile touch sizes.
- Preserve strict role checks and row-level access; no client-side admin bypasses or new privileged database functions.

## Validation
- Run the project typecheck and focused existing checks.
- Browser-test mobile and desktop flows for Home, Workouts, Progress, Chat, Profile, Settings → Updates, the glass dock, and admin release publishing.
- Verify update states for: no update, update metadata without a deployed worker, waiting worker activation, required release, and APK download URL.
- Confirm no new console errors, unsafe links, clipped navigation text, or overlapping controls.

## Technical note
A web app cannot download arbitrary code from an admin record and install it safely. The real web update path installs the latest published deployment through the service worker; the admin release record controls messaging, rollout, requirements, notes, and native download links.
