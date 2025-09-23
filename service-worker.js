// Basic service worker for offline caching & update channel
const APP_VERSION = "1.0.0";
const CACHE_NAME = "aiub-courses-v1";
const CORE_ASSETS = [
  "./",
  "index.html",
  "offer_courses.html",
  "routine.html",
  "css/style.css",
  "css/offer_courses.css",
  "css/routine.css",
  "css/mediaqueries.css",
  "js/script.js",
  "js/offer_script.js",
  "js/routine.js",
  "js/theme.js",
  "manifest.webmanifest",
  "offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      self.clients.claim();
    })
  );
});

// Listen for skip waiting message
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
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
