const cacheName = "travel-map-v1041";
const shellFiles = ["./", "./index.html", "./styles.css?v=250", "./vendor/openrailwaymap/composite.js?v=1", "./vendor/openrailwaymap/style.json?v=1", "./vendor/openrailwaymap/legend.json?v=1", "./railway-vector.js?v=11", "./earthquake-online.js?v=7", "./volcano-catalog.js?v=3", "./esri-relief.js?v=2", "./gcj-region.js?v=1", "./basemap-alignment.js?v=4", "./great-wall.js?v=40", "./western-regions.js?v=2", "./historical-periods.js?v=8", "./imperial-tombs.js?v=87", "./data/imperial-tombs/catalog.json?v=63", "./map-resolution.js?v=1", "./vendor/geology/vector-tile.js?v=1", "./geology-providers.js?v=12", "./geology-auto.js?v=11", "./data/geology/source-scales.json?v=1", "./geology-legend.js?v=31", "./ethnic-translations.js?v=5", "./ethnic-kin.js?v=1", "./greg-translations.js?v=3", "./ethnic-regions.js?v=52", "./data/country-borders-unified.geojson?v=4", "./ancient-capital-walls.js?v=91", "./luoyang-capital-evolution.js?v=18", "./beijing-capital-evolution.js?v=16", "./angkor-sites.js?v=2", "./data/angkor/osm.geojson?v=2", "./data/angkor/efeo.geojson?v=2", "./data/angkor/surroundings.geojson?v=2", "./app.js?v=892"];

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

async function freshCapitalCatalog(request) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (!response.ok) throw new Error(`Capital catalog HTTP ${response.status}`);
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith(".pmtiles")) return;
  if (/\/data\/(china-ancient-capitals|western-regions-36)\.json$/.test(url.pathname)) {
    event.respondWith(freshCapitalCatalog(event.request));
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request, { cache: "no-store" }).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.searchParams.has("v") || url.pathname.includes("/data/") || url.pathname.includes("/vendor/openrailwaymap/") || /\.(?:js|css|png|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
});
