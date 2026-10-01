# FitxFusion 8.3 — Real-Data Audit, Live Features & Settings Upgrade

## Goal
Remove every fake result (random numbers, timed "success" messages, invented scans) and replace it with real data or a clear "not available" state. Add new live features and harden the Settings page.

## 1. Fake-simulation cleanup (priority)
Scan found invented values in these areas. Each will show real data or an honest empty state:

| Area | Fake behavior today | Fix |
|---|---|---|
| Fitness Hub (unified / enhanced) | Random heart rate, steps, calories | Read from saved workouts + connected watch only |
| App Integrations (Google Fit, Strava, etc.) | Random "synced" numbers, fake connect | Mark as "Coming soon" unless a real connection exists |
| Smartwatch Hub, Watch Panel, Find Device | Random readings / fake ring | Use the real Bluetooth layer from 8.2 |
| Health Metrics, Biometric HUD | Generated vitals | Show recorded data or "No data yet" |
| AI Security, Mobile Security Center, Security Center, Monthly Scan | Random threat scores, fake scans | Real checks: HTTPS, app lock on, passkey saved, 2FA, permissions granted, session age |
| Workout AI Analyzer | Random form scores | Use the AI coach function on real session history |
| Chat (FitFusion chat, AI chatbot, assistant) | Canned random replies | Route all replies through the real AI coach |
| About / Performance panel | Random metrics | Browser Performance + storage APIs only |

Random IDs (message IDs, channel names) are fine and stay.

## 2. New live (realtime) features
- **Live activity feed:** new community posts, likes and comments appear instantly.
- **Live presence:** see which chat contacts are online, with "typing…" indicators.
- **Cross-device settings sync:** changing a setting on one device updates others instantly.
- **Active sessions list:** see devices signed in, sign out others.
- **Live workout streak & weekly goal ring** on Home, updating when a session is saved.
- **Live admin broadcast** already exists — extend to Settings banner.

## 3. Settings page upgrade
- Search box across all settings, with jump-to-section.
- **Security:** real security score (from checks above), active sessions, sign-out-everywhere, login history (from audit events), change password with current-password check, leaked-password check toggle.
- **Privacy:** profile visibility, who can message me, hide from leaderboard, download my data, delete account request.
- **Notifications:** quiet hours, per-type toggles, test notification (real push).
- **Workout:** default rest time, units, auto-start next exercise, voice cues.
- **Data:** storage used, clear cache, backup/restore to cloud (real file).
- "Saved" / "Sync failed" indicator per change; reset-section button.
- Fix any toggle that doesn't persist; error-free load (verified in browser).

## 4. Release
- Version 8.3.0 with changelog, published to Settings → App Update; activates only after deployment.

## Technical details
- Replace `Math.random` data paths in listed components; keep ID uses.
- Realtime via unique per-hook channels on posts, post_likes, post_comments, chat_messages, user_settings; presence via Realtime presence channel.
- Login history uses analytics_events (user-scoped); sessions via auth API.
- Security score computed client-side from real state; no server claims.
- Enable password HIBP + require current password via auth config.
- Bump APP_VERSION, package.json, sw.js cache, insert app_releases row.
- Validate: typecheck, build log, Playwright pass over Home/Settings/Chat/Smartwatch.
