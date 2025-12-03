// Basic service worker for offline caching & update channel
const APP_VERSION = "2.0.0";
const CACHE_NAME = `aiub-courses-v${APP_VERSION}`;
const CORE_ASSETS = [
  "./",
  "index.html",
  "offer_courses.html",
  "routine.html",
  "install-guide.html",
  "create-icons.html",
  "css/style.css",
  "css/offer_courses.css",
  "css/routine.css",
  "css/mediaqueries.css",
  "css/index.css",
  "js/script.js",
  "js/offer_script.js",
  "js/routine.js",
  "js/theme.js",
  "js/pwa.js",
  "js/modal.js",
  "manifest.webmanifest",
  "offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache assets one by one, skip if any fail
      const promises = CORE_ASSETS.map(async (asset) => {
        try {
          await cache.add(asset);
          console.log(`[SW] Cached: ${asset}`);
        } catch (error) {
          console.warn(`[SW] Failed to cache: ${asset}`, error);
        }
      });
      await Promise.allSettled(promises);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      self.clients.claim();
      
      // Notify all clients about the new version
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'VERSION_UPDATE',
          version: APP_VERSION
        });
      });
    })
  );
});

// Listen for skip waiting message
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data === "GET_VERSION") {
    event.ports[0].postMessage({
      version: APP_VERSION,
      cacheName: CACHE_NAME
    });
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(() => caches.match("offline.html"));
    })
  );
});
