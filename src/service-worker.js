/* eslint-disable no-restricted-globals */

// CRA / Workbox required precaching
import { precacheAndRoute } from "workbox-precaching";

// This is injected at build time by CRA
precacheAndRoute(self.__WB_MANIFEST);

// --------------------------------------------------
// Basic service worker lifecycle (safe defaults)
// --------------------------------------------------

self.addEventListener("install", (event) => {
  // Activate new SW immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// --------------------------------------------------
// Simple fetch strategy (safe fallback)
// Network first → fallback to cache
// --------------------------------------------------

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});