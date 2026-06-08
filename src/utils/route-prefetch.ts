/**
 * Route Prefetch — pre-warms lazy route chunks so subsequent clicks
 * feel instant. Runs after first paint and during browser idle time.
 */

type Importer = () => Promise<any>;

const routes: Record<string, Importer> = {
  "/": () => import("@/pages/Index"),
  "/workouts": () => import("@/pages/workouts"),
  "/progress": () => import("@/pages/progress"),
  "/profile": () => import("@/pages/profile"),
  "/chat": () => import("@/pages/chat"),
  "/settings": () => import("@/pages/settings"),
  "/subscription": () => import("@/pages/subscription"),
  "/community": () => import("@/pages/community"),
  "/notifications": () => import("@/pages/notifications"),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string) {
  if (prefetched.has(path)) return;
  const importer = routes[path];
  if (!importer) return;
  prefetched.add(path);
  importer().catch(() => prefetched.delete(path));
}

export function prefetchAllRoutes() {
  const idle =
    (window as any).requestIdleCallback ||
    ((cb: any) => window.setTimeout(cb, 1));
  Object.keys(routes).forEach((path, i) => {
    idle(() => prefetchRoute(path), { timeout: 1500 + i * 250 });
  });
}
