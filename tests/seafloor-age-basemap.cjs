const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const tileRoot = path.join(root, "data", "seafloor-age-vegetation");
const contourTileRoot = path.join(root, "data", "seafloor-age-contours");

assert.match(html, /option value="seafloorAge"/);
assert.match(html, /data-i18n="providerSeafloorAge"/);
assert.match(app, /seafloorAge:\s*\{/);
assert.match(app, /data\/seafloor-age-vegetation\/\{z\}\/\{x\}\/\{y\}\.jpg/);
assert.match(app, /maxNativeZoom: 4/);
assert.match(app, /maxzoom: provider\.maxNativeZoom \|\| 18/);
assert.match(html, /option value="seafloorContours"/);
assert.match(html, /id="seafloorContourLegend"/);
assert.match(app, /seafloorContours:\s*\{/);
assert.match(app, /data\/seafloor-age-contours\/\{z\}\/\{x\}\/\{y\}\.jpg/);

const tiles = [];
for (const zoom of fs.readdirSync(tileRoot)) {
  for (const x of fs.readdirSync(path.join(tileRoot, zoom))) {
    for (const file of fs.readdirSync(path.join(tileRoot, zoom, x))) tiles.push(path.join(tileRoot, zoom, x, file));
  }
}
assert.equal(tiles.length, 341, "expected complete XYZ pyramid from z0 through z4");
assert.deepEqual([...fs.readFileSync(tiles[0]).subarray(0, 3)], [0xff, 0xd8, 0xff], "tiles are JPEG images");

const contourTiles = [];
for (const zoom of fs.readdirSync(contourTileRoot)) {
  for (const x of fs.readdirSync(path.join(contourTileRoot, zoom))) {
    for (const file of fs.readdirSync(path.join(contourTileRoot, zoom, x))) contourTiles.push(path.join(contourTileRoot, zoom, x, file));
  }
}
assert.equal(contourTiles.length, 341, "expected complete contour XYZ pyramid from z0 through z4");
assert.deepEqual([...fs.readFileSync(contourTiles[0]).subarray(0, 3)], [0xff, 0xd8, 0xff], "contour tiles are JPEG images");

console.log("PASS: NOAA seafloor-age vegetation and contour basemaps are locally tiled and wired");
