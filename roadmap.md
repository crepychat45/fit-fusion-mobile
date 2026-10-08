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
