const CACHE_NAME = "levelup-rpg-v1";

// Install: Cache the shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/logo192.png",
        "/logo512.png",
        "/sounds/correct.mp3",
        "/sounds/wrong.mp3",
        "/sounds/boss.mp3",
        "/sounds/win.mp3",
      ]);
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache dynamic assets (JS, CSS) on first load
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Cache JS, CSS, and sounds for offline use
        if (
          response.status === 200 &&
          (event.request.destination === "script" ||
            event.request.destination === "style" ||
            event.request.destination === "audio" ||
            event.request.url.endsWith(".png") ||
            event.request.url.endsWith(".ico"))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});