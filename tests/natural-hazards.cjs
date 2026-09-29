const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const earthquakes = JSON.parse(fs.readFileSync(path.join(root, "data", "historical-earthquakes.json"), "utf8"));
const volcanoes = JSON.parse(fs.readFileSync(path.join(root, "data", "global-volcanoes.json"), "utf8"));

assert.match(html, /id="showEarthquakesOnMap"/);
assert.match(html, /id="showVolcanoesOnMap"/);
assert.match(html, /id="earthquakeMagnitude"/);
assert.match(app, /earthquakeMinMagnitude: 5/);
assert.match(app, /function syncMapLibreHazardOverlays/);
assert.match(app, /earthquake-points/);
assert.match(app, /volcano-points/);
assert.match(app, /function createVolcanoTriangleImage/);
assert.match(app, /volcano-triangle-outline/);
assert.match(app, /4, 2, 6, 3\.6, 8, 6\.5/);
assert.match(app, /mouseenter", "earthquake-points"/);
assert.match(app, /mouseenter", "volcano-points"/);
assert.ok(earthquakes.items.length > 80000, "expected merged NOAA and ISC-GEM earthquake history");
assert.ok(earthquakes.items.filter((item) => item.source === "ISC-GEM").length > 80000, "expected ISC-GEM main and supplementary records");
assert.ok(earthquakes.items.filter((item) => item.source === "ISC-GEM" && item.uncertain).length > 9000, "expected uncertain supplementary records to remain identified");
assert.ok(earthquakes.items.filter((item) => Number(item.longitude) >= 73 && Number(item.longitude) <= 135 && Number(item.latitude) >= 18 && Number(item.latitude) <= 54).length > 7000, "expected substantially denser coverage around China");
assert.ok(volcanoes.items.length > 2600, "expected complete Holocene and Pleistocene volcano coverage");
assert.ok(volcanoes.items.filter((item) => item.epoch === "Holocene").length > 1200, "expected complete Holocene catalogue");
assert.ok(volcanoes.items.filter((item) => item.epoch === "Pleistocene").length > 1300, "expected optional Pleistocene catalogue");
assert.match(html, /id="includePleistoceneVolcanoes"/);
assert.match(app, /volcanoIncludePleistocene: false/);
assert.ok(earthquakes.items.some((item) => Number(item.year) < 0), "expected BCE earthquake records");
assert.ok(volcanoes.items.every((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))));

console.log("PASS: historical earthquake and volcano overlays, filters, data, and controls are wired");
