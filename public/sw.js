const CACHE_NAME = "serafim-v2";
const STATIC_ASSETS = ["/", "/favicon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests (Cache API only supports GET)
  if (request.method !== "GET") return;

  // Skip API requests entirely — never cache admin/API data
  if (request.url.includes("/api/") || request.url.includes("/admin")) {
    return;
  }

  // Cache-first for static assets
  if (
    request.destination === "image" ||
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          }),
      ),
    );
    return;
  }

  // Network-first for navigation
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || caches.match("/"))),
  );
});
