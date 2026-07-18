/* eslint-disable no-restricted-globals */

const CACHE_NAME = "teenbuilder-v1";

// Install: Prepare cache, skip waiting
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate: Clean old caches, claim clients
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

// Fetch: Cache everything dynamically on first visit
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed — return cached if available
          return cached || new Response("Offline — resource not cached", { status: 503 });
        });

      // Return cached version immediately if available, otherwise wait for fetch
      return cached || fetchPromise;
    })
  );
});
