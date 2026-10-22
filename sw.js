const cacheName = "travel-map-v1306";
const shellFiles = ["./data/nanjing-historic-sites.geojson?v=19", "./sources/nanjing.html", "./sources/luoyang.html", "./sources/luoyang-reference.png", "./", "./index.html", "./styles.css?v=276", "./vendor/openrailwaymap/composite.js?v=1", "./vendor/openrailwaymap/style.json?v=2", "./vendor/openrailwaymap/legend.json?v=1", "./railway-vector.js?v=12", "./earthquake-online.js?v=7", "./volcano-catalog.js?v=3", "./esri-relief.js?v=2", "./gcj-region.js?v=2", "./basemap-alignment.js?v=7", "./great-wall.js?v=42", "./western-regions.js?v=4", "./historical-periods.js?v=9", "./imperial-tombs.js?v=99", "./data/imperial-tombs/catalog.json?v=70", "./map-resolution.js?v=1", "./vendor/geology/vector-tile.js?v=1", "./geology-providers.js?v=12", "./geology-auto.js?v=11", "./data/geology/source-scales.json?v=1", "./geology-legend.js?v=31", "./ethnic-translations.js?v=5", "./ethnic-kin.js?v=1", "./greg-translations.js?v=3", "./ethnic-regions.js?v=52", "./data/country-borders-unified.geojson?v=4", "./ancient-capital-walls.js?v=184", "./luoyang-capital-evolution.js?v=23", "./beijing-capital-evolution.js?v=21", "./pompeii-sites.js?v=8", "./classical-sites.js?v=93", "./data/classical-sites/catalog.json?v=71", "./data/classical-sites/sites.geojson?v=71", "./data/pompeii/sites.geojson?v=1", "./capital-map-layers.js?v=12", "./gallup-safety.js?v=6", "./data/gallup-safety-2025.geojson?v=1", "./safeture-risk.js?v=13", "./data/safeture-display-20261017.geojson?v=1", "./data/safeture-country-risk-20261017.geojson?v=1", "./data/safeture-regional-risk-20261017.geojson?v=1", "./data/safeture-regional-summaries-20261017.json?v=1", "./app.js?v=1105"];

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
