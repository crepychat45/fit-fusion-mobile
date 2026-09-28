# Technical decisions

- Treat the bundled `APP_VERSION` as the installed web version, not a writable browser preference, because an announced release does not prove code deployment.
- Activate web updates only through a waiting deployed service worker; never simulate a download, signature check, install, or rollback in browser state.
- Use user-scoped database queries for activity and profile exports, while keeping temporary workout queues and chat drafts on the device for fast recovery.