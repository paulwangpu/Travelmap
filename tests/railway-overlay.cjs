const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

assert.match(html, /id="showRailwaysOnMap"/);
assert.match(html, /data-i18n="overlayRailways"/);
assert.match(html, /id="mapOverlayLegends"/);
assert.match(html, /id="railwayLegend"/);
assert.match(html, /data-i18n="railwayLegendHighspeed"/);
assert.match(html, /data-i18n="railwayLegendInactive"/);
assert.match(app, /railways: false/);
assert.match(app, /tiles\.openrailwaymap\.org\/standard/);
assert.match(app, /function syncMapLibreRailwayOverlay/);
assert.match(app, /railwayPane/);
assert.match(app, /OpenStreetMap contributors · OpenRailwayMap/);
assert.match(app, /railwayLegend\.hidden = !overlays\.railways/);
assert.match(app, /overlayLegends\.hidden = .*?!overlays\.populationDensity && !overlays\.railways/);
assert.match(app, /railwayLegendHighspeed: "高速铁路（>200 km\/h）"/);
assert.match(app, /overlayRailways: "铁路线路"/);
assert.match(html, /class="railway-legend-details"/);
assert.match(html, /id="railwayOfficialLegend"/);
assert.match(html, /openrailwaymap\.org\/legend-generator\.php\?style=standard/);
assert.match(html, /data-i18n="railwayLegendNote"/);
assert.match(html, /data-i18n="railwayLegendHint"/);
assert.match(html, /data-i18n="railwayLegendOfficial"/);

console.log("PASS: optional railway overlay and non-overlapping railway legend are wired");
