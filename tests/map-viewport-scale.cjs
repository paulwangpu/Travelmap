const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(app.slice(app.indexOf('function normalizeMapViewport('), app.indexOf('function rememberMapViewportSoon(')), context);
for (const zoom of [0, 2, 6.375, 10, 18]) {
  const saved = context.normalizeMapViewport({ center: [104.06, 30.67], zoom, scaleBasis: 'mercator512' });
  const leafletZoom = context.leafletViewportZoom(saved);
  assert.equal(256 * 2 ** leafletZoom, 512 * 2 ** zoom, 'same world pixel size preserves visible bounds');
  assert.equal(leafletZoom - 1, zoom, 'return switch retains fractional zoom');
  assert.equal(context.leafletViewportZoom(context.normalizeMapViewport(JSON.parse(JSON.stringify(saved)))), leafletZoom, 'reload preserves scale');
  assert.deepEqual(Array.from(saved.center), [104.06, 30.67]);
}
assert.equal(context.leafletViewportZoom(context.normalizeMapViewport({ center: [0, 0], zoom: 6.375 })), 6.375, 'legacy Leaflet viewport keeps its meaning');
assert(app.includes('zoomSnap: 0'));
assert(app.includes("zoom:previous.getZoom() - (leafletMap ? 1 : 0)"));
console.log('PASS: engine switch scale, fractional zoom, reload and legacy viewport');
