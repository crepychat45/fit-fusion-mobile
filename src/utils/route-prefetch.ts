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
    ((cb: any, opts?: { timeout?: number }) => window.setTimeout(cb, opts?.timeout ?? 3000));
  const priorityRoutes = ["/workouts", "/progress", "/profile", "/settings"];
  // Sequential (not parallel) — avoids saturating the network on cold start,
  // which was inflating resource durations and triggering slow-op warnings.
  let chain: Promise<any> = Promise.resolve();
  priorityRoutes.forEach((path, i) => {
    idle(
      () => {
        chain = chain.then(
          () => new Promise<void>((res) => {
            const importer = routes[path];
            if (!importer || prefetched.has(path)) return res();
            prefetched.add(path);
            importer().catch(() => prefetched.delete(path)).finally(() => res());
          })
        );
      },
      { timeout: 6000 + i * 1500 }
    );
  });
}
