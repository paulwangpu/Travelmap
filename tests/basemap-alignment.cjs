const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const api = require('../basemap-alignment.js');
const app = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const context = {GcjRegion:require('../gcj-region.js')};
vm.runInNewContext(app.slice(app.indexOf('function isCoordinateInChina('), app.indexOf('function mapDisplayCoordinate(')), context);
const convert = context.wgsToGcj;
const angkorPixel=api.pixel(103.8589,13.4413,15),angkorGrid=api.grid(15,Math.floor(angkorPixel[0]/256),Math.floor(angkorPixel[1]/256),convert);
assert.ok(angkorGrid.points.every(p=>Math.abs(p.x-Math.floor(angkorPixel[0]/256)*256-p.u)<.001&&Math.abs(p.y-Math.floor(angkorPixel[1]/256)*256-p.v)<.001),'Foreign Google tiles must take the unchanged tile path');
const beijing = convert(116.397389, 39.908722);
assert.ok(Math.abs(beijing[0] - 116.403633) < 0.00001);
assert.ok(Math.abs(beijing[1] - 39.910125) < 0.00001);
assert.deepEqual(Array.from(convert(-73.98, 40.75)), [-73.98, 40.75]);
for(const p of [[103.8589,13.4413],[103.866,13.412],[103.967,13.599],[104.23,13.475],[103.974,13.343],[100.5018,13.7563],[105.8342,21.0278],[96.1951,16.8661],[106.9057,47.8864],[127,37.5665],[121.5654,25.033],[114.1694,22.3193],[113.5439,22.1987]]){
 assert.deepEqual(Array.from(convert(...p)),p,'Foreign / non-GCJ coordinate must remain unchanged: '+p);
 assert.deepEqual(Array.from(context.gcjToWgs(...p)),p);
}
for(const p of [[121.4737,31.2304],[102.8329,24.8801],[110.3312,20.0319],[87.6168,43.8256],[91.117,29.647]])assert.notDeepEqual(Array.from(convert(...p)),p,'Retain mainland correction: '+p);
for (const z of [0, 7, 12, 18]) {
  const p = api.pixel(116.397389, 39.908722, z);
  const ll = api.coordinate(...p, z);
  assert.ok(Math.abs(ll[0] - 116.397389) < 1e-9);
  assert.ok(Math.abs(ll[1] - 39.908722) < 1e-9);
  const x = Math.floor(p[0] / 256), y = Math.floor(p[1] / 256);
  const mesh = api.grid(z, x, y, convert);
  assert.ok(mesh.points.every(q => Number.isFinite(q.x) && Number.isFinite(q.y)));
  const east = api.grid(z, x + 1, y, convert);
  for (let j = 0; j <= mesh.steps; j++) {
    const a = mesh.points[j * 9 + 8], b = east.points[j * 9];
    assert.equal(a.x, b.x); assert.equal(a.y, b.y);
  }
}
assert.equal(api.shifted.has('googleSatellite'), false);
assert.equal(api.shifted.has('esriRelief'), false);
assert.equal(api.shifted.has('googleTerrain'), true);
assert.equal(api.shifted.has('bingRoad'), true);
assert.equal(api.shifted.has('bingAerial'), false);
assert.match(app, /tileUrl: \(z, x, y\) => bingTileUrl\("road", z, x, y\)/);
assert.match(app, /BasemapAlignment\.register/);
assert.match(app, /BasemapAlignment\.tile/);
const raw = { type: 'LineString', coordinates: [[...beijing, 25], [-73.98, 40.75, 10]] };
const snapshot = JSON.stringify(raw);
let conversions=0;
const countedInverse=(x,y)=>{conversions++;return context.gcjToWgs(x,y);};
const cachedPath=api.pathGeometry({importedGeometry:raw},countedInverse);
assert.equal(api.pathGeometry({importedGeometry:raw},countedInverse),cachedPath);
assert.equal(conversions,2,'Repeated refresh must reuse the corrected path');
assert.equal(api.pathGeometry({importedGeometry:raw,pathCoordinateSystem:'wgs84'},countedInverse),raw);
const edited={...raw,coordinates:raw.coordinates.map(p=>p.slice())};
assert.notEqual(api.pathGeometry({importedGeometry:edited},countedInverse),cachedPath);
const corrected = api.pathGeometry({ importedGeometry: raw }, context.gcjToWgs);
assert.ok(Math.abs(corrected.coordinates[0][0] - 116.397389) < 1e-8);
assert.ok(Math.abs(corrected.coordinates[0][1] - 39.908722) < 1e-8);
assert.equal(corrected.coordinates[0][2], 25);
assert.deepEqual(corrected.coordinates[1], [-73.98, 40.75, 10]);
assert.equal(JSON.stringify(raw), snapshot);
assert.equal(api.pathGeometry({ importedGeometry: raw, pathCoordinateSystem: 'wgs84' }, context.gcjToWgs), raw);
const multi = api.pathGeometry({ importedGeometry: { type: 'MultiLineString', coordinates: [raw.coordinates] } }, context.gcjToWgs);
assert.deepEqual(multi.coordinates[0], corrected.coordinates);
const polygon = { type: 'Polygon', coordinates: [raw.coordinates] };
assert.equal(api.pathGeometry({ importedGeometry: polygon }, context.gcjToWgs), polygon);
assert.match(app, /geometry: pathDisplayGeometry\(place\)/);
assert.match(app, /place\.pathCoordinateSystem = "wgs84"/);
console.log('PASS: legacy path correction, WGS84 opt-out, foreign identity, altitude, multiline and original data preservation');
console.log('PASS: GCJ control point, foreign identity, mesh continuity at z0/7/12/18, raster/Leaflet wiring');
