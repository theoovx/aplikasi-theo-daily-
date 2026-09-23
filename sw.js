const CACHE_NAME = "theo-daily-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification(
      event.data.title || "THEO DAILY",
      {
        body: event.data.body || "Ada sesuatu yang perlu kamu lakukan.",
        icon: event.data.icon || "",
        badge: event.data.icon || ""
      }
    );
  }
});
