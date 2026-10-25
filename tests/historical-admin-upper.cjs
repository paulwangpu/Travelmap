const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const catalog = read('data/historical-admin/catalog.json');
const radians = n => n * Math.PI / 180;
function area(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i], b = ring[i + 1];
    sum += radians(b[0] - a[0]) * (2 + Math.sin(radians(a[1])) + Math.sin(radians(b[1])));
  }
  return Math.abs(sum * 6371008.8 ** 2 / 2) / 1e6;
}
const polygons = f => f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
function inRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > point[1]) !== (b[1] > point[1]) &&
        point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
const contains = (feature, point) => polygons(feature).some(p => inRing(point, p[0]) && !p.slice(1).some(r => inRing(point, r)));
let parts = 0, holes = 0;
for (const period of catalog.periods) {
  const upper = read(period.file).features.filter(f => f.properties.level === 'upper');
  assert.equal(upper.length, period.upperRegions);
  for (const feature of upper) {
    const ps = polygons(feature);
    const sizes = ps.map(p => area(p[0]) - p.slice(1).reduce((sum, ring) => sum + area(ring), 0));
    const largest = Math.max(...sizes);
    // Spherical audit tolerates 1% difference from the ellipsoidal build projection.
    assert(sizes.every(size => size === largest || size >= 990), `${feature.properties.name}: tiny secondary polygon`);
    for (const polygon of ps) for (const ring of polygon.slice(1)) {
      assert(area(ring) >= 990, `${feature.properties.name}: small internal hole`);
      holes++;
    }
    assert(contains(feature, feature.properties.labelCoordinates), 'Label must remain inside the cleaned region');
    parts += ps.length;
  }
}
const qing = read('data/historical-admin/china-1820.geojson').features.filter(f => f.properties.level === 'upper');
assert(contains(qing.find(f => f.properties.name === 'Guangdong Prov.'), [109.5, 19.2]), 'Keep Hainan');
assert(contains(qing.find(f => f.properties.name === 'Fujian Prov.'), [121, 23.7]), 'Keep Taiwan');
assert.equal(catalog.upperDisplayCleanup.minimumComponentAreaKm2, 1000);
assert.equal(catalog.upperDisplayCleanup.narrowGapWidthM, 2000);
assert(catalog.upperDisplayCleanup.periods.every(p => p.closedGapAreaKm2 > 0), 'Narrow gap closing must be applied in all four periods');
console.log(`PASS: upper-region overview has no small fragments or holes; ${parts} components, ${holes} large holes; Hainan and Taiwan retained`);
