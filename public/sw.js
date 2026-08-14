// FitFusion Service Worker v9 (v7.5.0)
// Strategies:
//  - Navigations & HTML: network-first with 3s timeout, cache fallback
//  - Hashed JS/CSS (Vite /assets/): stale-while-revalidate + cache
//  - Images: cache-first with expiration
//  - API/Supabase: network-first (no offline replay for auth/mutations)
// Messages: SKIP_WAITING, CLEAR_CACHES, GET_CACHE_INFO
const VERSION = "v9-7.5.0";
const STATIC_CACHE = `fitfusion-static-${VERSION}`;
const ASSET_CACHE = `fitfusion-assets-${VERSION}`;
const IMAGE_CACHE = `fitfusion-images-${VERSION}`;
const RUNTIME_CACHE = `fitfusion-runtime-${VERSION}`;
const IMAGE_MAX_ENTRIES = 80;

const PRECACHE = ["/", "/favicon.ico", "/placeholder.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const keep = new Set([STATIC_CACHE, ASSET_CACHE, IMAGE_CACHE, RUNTIME_CACHE]);
      await Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") self.skipWaiting();
  if (data.type === "CLEAR_CACHES") {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        event.ports[0]?.postMessage({ ok: true, cleared: keys.length });
      })(),
    );
  }
  if (data.type === "GET_CACHE_INFO") {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        const stats = await Promise.all(
          keys.map(async (name) => {
            const cache = await caches.open(name);
            const entries = await cache.keys();
            return { name, entries: entries.length };
          }),
        );
        event.ports[0]?.postMessage({ ok: true, caches: stats, version: VERSION });
      })(),
    );
  }
});

const timeout = (p, ms) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("network-timeout")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

async function networkFirstNav(request) {
  try {
    const res = await timeout(fetch(request), 3500);
    const cache = await caches.open(STATIC_CACHE);
    cache.put("/", res.clone()).catch(() => {});
    return res;
  } catch {
    const cached = (await caches.match(request)) || (await caches.match("/"));
    return cached || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

async function cacheFirstImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      cache.put(request, res.clone()).catch(() => {});
      trimCache(IMAGE_CACHE, IMAGE_MAX_ENTRIES).catch(() => {});
    }
    return res;
  } catch {
    return (await caches.match("/placeholder.svg")) || new Response("", { status: 404 });
  }
}

async function networkFirstApi(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.protocol === "chrome-extension:") return;

  // Never touch OAuth callbacks or auth endpoints
  if (url.pathname.startsWith("/~oauth") || url.pathname.startsWith("/auth/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNav(request));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  if (url.hostname.includes("supabase.co") || url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (url.pathname.startsWith("/assets/") || /\.(js|css|woff2?)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "FitFusion", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "FitFusion", {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [180, 90, 180],
      data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || "/"));
});
