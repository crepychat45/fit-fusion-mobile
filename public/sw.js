// Enhanced Service Worker for FitFusion
const CACHE_NAME = "fitfusion-v1";
const STATIC_CACHE = "fitfusion-static-v1";
const DYNAMIC_CACHE = "fitfusion-dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/placeholder.svg",
  "/manifest.json",
];

const CACHE_STRATEGIES = {
  images: "cache-first",
  api: "network-first",
  static: "cache-first",
};

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static assets...");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      }),
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// Fetch event with enhanced caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // Handle different types of requests
  if (request.destination === "image") {
    event.respondWith(handleImageRequest(request));
  } else if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co")
  ) {
    event.respondWith(handleApiRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Cache-first strategy for images
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Image fetch failed:", error);
    // Return a fallback image if available
    const fallback = await caches.match("/placeholder.svg");
    return fallback || new Response("Image not available", { status: 404 });
  }
}

// Network-first strategy for API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("API request failed, trying cache:", error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response("API unavailable", { status: 503 });
  }
}

// Cache-first strategy for static assets
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Static request failed:", error);

    // For navigation requests, return the cached index.html
    if (request.mode === "navigate") {
      const indexCache = await caches.match("/");
      if (indexCache) {
        return indexCache;
      }
    }

    return new Response("Page not available", { status: 404 });
  }
}

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "workout-sync") {
    event.waitUntil(syncWorkoutData());
  }
});

async function syncWorkoutData() {
  try {
    // Sync any pending workout data when connection is restored
    const pendingData = await getStoredWorkoutData();

    if (pendingData.length > 0) {
      for (const data of pendingData) {
        await fetch("/api/sync-workout", {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      // Clear stored data after successful sync
      await clearStoredWorkoutData();
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Helper functions for offline data storage
async function getStoredWorkoutData() {
  // Implementation would depend on IndexedDB or similar storage
  return [];
}

async function clearStoredWorkoutData() {
  // Implementation would clear the offline storage
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/favicon.ico",
      },
      {
        action: "close",
        title: "Close",
        icon: "/favicon.ico",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
  }
});
