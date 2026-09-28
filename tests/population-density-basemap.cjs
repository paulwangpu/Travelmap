const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const archivePath = path.join(root, "data", "population-density-2020-z0-8.pmtiles");

assert.doesNotMatch(html, /option value="population"/);
assert.match(html, /id="showPopulationDensityOnMap"/);
assert.match(html, /map-thematic-overlays/);
assert.match(html, /pmtiles@4\.4\.0\/dist\/pmtiles\.js/);
assert.match(app, /populationDensityArchive = "data\/population-density-2020-z0-8\.pmtiles"/);
assert.match(app, /populationDensity: false/);
assert.match(app, /function syncMapLibrePopulationDensityOverlay/);
assert.match(app, /value === "population"\) return "googleTerrain"/);
assert.match(app, /registerPmtilesMapLibreProtocol\(\)/);
assert.match(app, /pmtiles:\/\//);
assert.match(app, /leafletRasterLayer/);
assert.match(serviceWorker, /url\.pathname\.endsWith\("\.pmtiles"\)/);

assert.ok(fs.existsSync(archivePath), "population PMTiles archive exists");
const stat = fs.statSync(archivePath);
assert.ok(stat.size > 1_000_000, "population archive contains generated tiles");
assert.ok(stat.size < 100_000_000, "population archive remains under GitHub's 100 MB file limit");
assert.equal(fs.readFileSync(archivePath).subarray(0, 7).toString("ascii"), "PMTiles");

console.log("PASS: population density overlay is wired for MapLibre and Leaflet with a compact PMTiles archive");
