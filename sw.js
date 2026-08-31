const cacheName = "travel-map-v455";
const shellFiles = ["./", "./index.html", "./styles.css", "./app.js?v=455"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(shellFiles)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("travel-map-") && key !== cacheName).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function cacheFirst(request) {
  return caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(cacheName).then((cache) => cache.put(request, response.clone()));
    return response;
  }));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.searchParams.has("v") || url.pathname.includes("/data/") || /\.(?:js|css|png|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
});
