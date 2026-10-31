# FitxFusion 8.1 roadmap
## Settings reliability enhancement (2026-10-29)
- [x] Fix confirmed save/sync errors and misleading success indicators
- [x] Remove confirmed unsupported privacy, workout and notification panels; retain real permission and push tools
- [x] Improve Settings navigation and verify authenticated saves across two isolated browsers
- [x] Run targeted regression tests and check app errors
- [x] Verify preference save → second-browser live update → reload; backup download → import → account save → second-browser readback; restore original preferences
- [ ] Remaining legacy extras need individual consumer audits before claiming every Settings option is functional (not covered by this focused pass)

- [x] Shared live activity summary and Home Today strip
- [x] Persisted Workouts queue and equipment filters
- [x] Progress 7/30/90-day live session ranges
- [x] Chat draft recovery and retry-safe status
- [x] Profile privacy summary and portable export
- [x] Settings release status and real update lifecycle
- [x] Crystal Liquid Glass mobile dock
- [x] Admin release/link validation and auditing
- [x] Version/changelog/service-worker metadata 8.1.0
- [x] Typecheck and authenticated page-load browser validation
- [x] Authenticated workout/Progress/calendar/Settings click-through verified on 2026-10-28; hardware pairing remains device-only

# FitxFusion 8.2 roadmap
- [x] Refine mobile glass dock motion, contrast and touch behavior
- [x] Replace simulated smartwatch pairing, sensors, sync and find-watch claims with honest available capabilities
- [x] Add 8.2 changelog/version and release visibility without claiming undeployed code is installed
- [x] Verify mobile preview and update/watch interactions

## 8.3.0 (2026-10-01)
- [x] Removed fake data/scans/replies across Home, chat, security, about, backup
- [x] Live health, streak, presence, cross-device Settings sync
- [x] Settings: live security check, sessions, password change, privacy, quiet hours, workout prefs, storage
- [ ] Publish the current changes so deployed service-worker updates can deliver them (requires the user to publish)

## Master audit (2026-10-07)
- [x] One settings system (removed duplicate providers)
- [x] Crash-proof saved-data reading + central logger
- [x] Removed canned chat replies and sample profile/level/Pro/sleep on Home
- [x] FitScore + Your Week card on Home (real data only)
- [x] Settings overview: profile, security score, cloud sync
- [x] Settings consolidated into eight sections with all tools retained and legacy links resolved
- [x] Workouts: full-screen active workout + AI workout builder connected to library
- [x] Progress: consistent 7/30/90-day charts and session lists
- [x] Signed-in click-through testing (real AI generation, save/start/resume/finish, Progress, calendar and Settings search)

## 8.5.0 (2026-10-08)
- [x] New real tools in all Settings tabs
- [x] Latest Capacitor packages + Share/Clipboard/Browser/Orientation
- [x] Version 8.5.0 in package, app, service worker

## Full audit pass 1 (2026-10-11)
- [x] Removed floating version badge
- [x] One workout history store (migrates old keys), no double counting
- [x] Player: empty guard, last exercise counted, background-safe timer, resume, exit confirm, summary
- [x] Workouts: real streak/sessions, quick=short workouts, exercise/muscle search
- [x] Unit tests (vitest) for history and streaks
- [x] Settings consolidation: merged Enhanced+Developer tabs, removed fake validation/auto-save, added search button, duplicate Data Center removed
- [x] Progress/Home read from shared workout history
- [x] Custom builder, calendar, templates, PRs
- [x] Signed-in end-to-end testing
- [x] Progress page reads real workout history (charts, streaks, goals, achievements from useWorkoutHistory); Home already uses useLiveHealth
- [x] Custom workout builder at /create-workout (save to device, plays in player, appears in library)
- [x] Workout calendar at /schedule (month grid, schedule any workout with optional time, completed-day dots, upcoming list, start from calendar)
- [x] Workout templates in the builder (4 built-in starting points) and real Personal Records card on Progress (longest session, best day, best week, longest streak from recorded sessions)
- [x] Signed-in browser verification: template → save → library (toast + count), calendar page, progress page; no page errors

## Security audit pass (2026-10-17)
- [x] Revoked anon/authenticated EXECUTE on email-queue functions (enqueue/delete/read_batch/move_to_dlq/dispatch/wake)
- [x] Reviewed public-read findings: feature_flags, feature_switches, site_content, exercises, posts, post_comments, post_likes — intentional public/community data, writes restricted
- [x] Remaining linter warns (is_admin*, search_chat_contacts, shares_chat_thread) are required by RLS policies and chat — boolean-only, false positive
- [x] Performance pass (2026-10-17): lazy-loaded EnhancedChatSettings (was 204KB static in chat page, now 12KB on-demand); route prefetch skipped on saveData/2G connections; confirmed all routes lazy, export libs (jspdf/xlsx) already dynamic; build verified

## Tests pass (2026-10-17)
- [x] Added vitest coverage for custom workouts (save/replace/cap-50/delete/corruption) and schedule (add/sort/remove/cap-200/corruption/date-key) — 18 tests passing across 3 files
- [x] AI workout generator: signed-in users can save generated workouts to their library and start them immediately (converts AI plan to custom workout format)

## Remaining master-review work (2026-10-28)
- [x] Consolidate Settings into eight sections, preserve deep links and search, remove misleading global save claims
- [x] Unify Recent Sessions with workout history; add consistent 7/30/90-day analytics and local-calendar records
- [x] Preserve timed exercises in AI plans, validate generated results and prevent duplicate saves
- [x] Run regression tests and authenticated workout → Progress → calendar → Settings checks
- [x] Reconcile outdated checklist items and record verified results and external blockers

### Verification
- 29 tests passed across six files; local-date/streak tests also passed in Asia/Kolkata.
- Real AI request → save (duplicate save disabled) → start → exit → resume → finish → read back in all Progress ranges passed.
- Scheduling the saved AI routine, legacy units/updates links, invalid-tab fallback, Settings search → Chat, and eight navigation entries passed; no browser page errors.
- Latest automatic build: OK. Publishing and physical smartwatch/native capability tests remain external; no deployed-update or hardware success claimed.
