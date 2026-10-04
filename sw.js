const cacheName = "travel-map-v750";
const shellFiles = ["./", "./index.html", "./styles.css?v=200", "./vendor/openrailwaymap/composite.js?v=1", "./vendor/openrailwaymap/style.json?v=1", "./vendor/openrailwaymap/legend.json?v=1", "./railway-vector.js?v=11", "./earthquake-online.js?v=7", "./volcano-catalog.js?v=3", "./esri-relief.js?v=2", "./basemap-alignment.js?v=4", "./great-wall.js?v=34", "./western-regions.js?v=2", "./historical-periods.js?v=6", "./imperial-tombs.js?v=55", "./data/imperial-tombs/catalog.json?v=33", "./app.js?v=728"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(
    shellFiles.map((url) => new Request(url, { cache: "reload" }))
  )));
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
  if (url.pathname.endsWith(".pmtiles")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request, { cache: "no-store" }).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.searchParams.has("v") || url.pathname.includes("/data/") || url.pathname.includes("/vendor/openrailwaymap/") || /\.(?:js|css|png|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
});
