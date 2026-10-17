# FitxFusion 8.1 roadmap
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
- [ ] Verify authenticated click-through interactions — blocked by unavailable browser session after sandbox reset

# FitxFusion 8.2 roadmap
- [x] Refine mobile glass dock motion, contrast and touch behavior
- [x] Replace simulated smartwatch pairing, sensors, sync and find-watch claims with honest available capabilities
- [x] Add 8.2 changelog/version and release visibility without claiming undeployed code is installed
- [x] Verify mobile preview and update/watch interactions

## 8.3.0 (2026-10-01)
- [x] Removed fake data/scans/replies across Home, chat, security, about, backup
- [x] Live health, streak, presence, cross-device Settings sync
- [x] Settings: live security check, sessions, password change, privacy, quiet hours, workout prefs, storage
- [ ] Publish so the service worker can deliver 8.3.0 (needs user to publish)

## Master audit (2026-10-07)
- [x] One settings system (removed duplicate providers)
- [x] Crash-proof saved-data reading + central logger
- [x] Removed canned chat replies and sample profile/level/Pro/sleep on Home
- [x] FitScore + Your Week card on Home (real data only)
- [x] Settings overview: profile, security score, cloud sync
- [ ] Settings full 14-category redesign
- [ ] Workouts: full-screen active workout + AI workout builder
- [ ] Progress: deeper charts and time filters
- [ ] Signed-in click-through testing (test browser was signed out)

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
- [ ] Progress/Home read from shared workout history
- [ ] Custom builder, calendar, templates, PRs
- [ ] Signed-in end-to-end testing
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
