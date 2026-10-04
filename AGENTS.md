# Technical decisions

- Treat the bundled `APP_VERSION` as the installed web version, not a writable browser preference, because an announced release does not prove code deployment.
- Activate web updates only through a waiting deployed service worker; never simulate a download, signature check, install, or rollback in browser state.
- Use user-scoped database queries for activity and profile exports, while keeping temporary workout queues and chat drafts on the device for fast recovery.
- Show smartwatch health data only from an authenticated device capability or recorded user data; never generate sensor readings or connection success states.- Derive health, streak and activity numbers from `useLiveHealth` (recorded sessions, watch readings, user logs); never hardcode or randomize displayed metrics.
- Route every AI chat reply through `askCoach` (the real AI function); no canned or keyword-matched responses.
- Compute security scores only from `runSecurityChecks` (observable device/account state); never invent threats or scores.
- Store live-synced Settings groups under a `live` key in the matching user_settings column with a per-hook Realtime channel so other devices update instantly.
